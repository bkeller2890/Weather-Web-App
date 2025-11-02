const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const OUT_DIR = path.resolve(__dirname);
const SCREEN_DIR = path.join(OUT_DIR, 'screenshots');
if (!fs.existsSync(SCREEN_DIR)) fs.mkdirSync(SCREEN_DIR, { recursive: true });

const TARGET = 'http://127.0.0.1:8000/';
const CITIES = ['Dallas, TX', 'Indianapolis, IN', 'New York, NY', 'Cleveland, OH'];

function sanitizeName(name) {
  return name.replace(/[^a-z0-9\-]/gi, '_');
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  // Inject OpenWeatherMap API key into the page context securely.
  // Priority: OWM_API_KEY env var -> OPENWEATHER_API_KEY env var -> tools/owm_key.txt file
  let envKey = process.env.OWM_API_KEY || process.env.OPENWEATHER_API_KEY;
  if (!envKey) {
    // Try reading from tools/owm_key.txt
    try {
      const keyFile = path.join(__dirname, 'owm_key.txt');
      if (fs.existsSync(keyFile)) {
        envKey = fs.readFileSync(keyFile, 'utf8').trim();
      }
    } catch (e) {
      // ignore read errors
    }
  }
  if (envKey) {
    await page.evaluateOnNewDocument(key => {
      window.__OWM_API_KEY = key;
    }, envKey);
  }
  // Force stacked layout preference for screenshots
  await page.evaluateOnNewDocument(() => {
    try { localStorage.setItem('layoutPref', 'stack'); } catch (e) {}
  });
  page.setDefaultTimeout(20000);

  const results = [];

  // capture console messages
  page.on('console', msg => {
    const args = msg.args().map(a => {
      try { return a._remoteObject.value; } catch (e) { return String(a); }
    });
    // push to last result if exists, else keep
    const entry = { type: 'console', text: msg.text(), args };
    // store globally until assigned to a city
    if (!page._consoleStore) page._consoleStore = [];
    page._consoleStore.push(entry);
  });

  // capture network responses of interest
  page.on('response', async res => {
    try {
      const url = res.url();
      if (url.includes('openweathermap') || url.includes('weather.gov')) {
        const status = res.status();
        let body = '';
        try { body = await res.text(); } catch (e) { body = `<non-text response: ${e.message}>`; }
        const short = body && body.length > 2000 ? body.slice(0,2000) + '...[truncated]' : body;
        if (!page._networkStore) page._networkStore = [];
        page._networkStore.push({ url, status, body: short });
      }
    } catch (e) {
      // ignore
    }
  });

  await page.goto(TARGET, { waitUntil: 'networkidle2' });

  for (const city of CITIES) {
    // clear page stores
    page._consoleStore = [];
    page._networkStore = [];

    const sanitized = sanitizeName(city);
    const result = { city, timestamp: new Date().toISOString(), console: [], network: [], screenshot: '' };

    // focus input
    await page.waitForSelector('.search input');
    await page.click('.search input', { clickCount: 3 });
    await page.type('.search input', city, { delay: 50 });

    // click search button or press Enter
    const searchBtn = await page.$('[data-search-btn]');
    if (searchBtn) {
      await searchBtn.click();
    } else {
      await page.keyboard.press('Enter');
    }

    // wait for either .weather.active or .error to show
    try {
      await Promise.race([
        page.waitForSelector('.weather.active', { timeout: 15000 }),
        page.waitForSelector('.error', { timeout: 15000 })
      ]);
    } catch (err) {
      // timeout - continue
    }

    // small wait for network activity to finish
    await page.waitForTimeout(1000);

    // capture console and network stores
    result.console = page._consoleStore || [];
    result.network = page._networkStore || [];

    // take screenshot (safe): wrap in try/catch because page may close unexpectedly
    const shotPath = path.join(SCREEN_DIR, `${sanitized}.png`);
    try {
      await page.waitForSelector('body', { timeout: 5000 });
      await page.screenshot({ path: shotPath, fullPage: true });
      result.screenshot = shotPath;
    } catch (sErr) {
      // record the error but continue the test run
      result.screenshot = '';
      result.screenshotError = sErr && sErr.message ? sErr.message : String(sErr);
    }

    // capture visible city/temp if available
    try {
      const cityText = await page.$eval('.city', el => el.textContent.trim());
      const tempText = await page.$eval('.temp', el => el.textContent.trim());
      result.pageCity = cityText;
      result.pageTemp = tempText;
    } catch (e) {
      // ignore if elements missing
    }

    // record how many daily cards were rendered
    try {
      const dailyCount = await page.evaluate(() => {
        const el = document.querySelectorAll('.daily-item');
        return el ? el.length : 0;
      });
      result.dailyItemsRendered = dailyCount;
    } catch (e) {
      result.dailyItemsRendered = -1;
    }

    results.push(result);

    // small delay between searches
    await page.waitForTimeout(700);
  }

  // write results
  const outPath = path.join(OUT_DIR, 'ui_test_logs.json');
  fs.writeFileSync(outPath, JSON.stringify({ runAt: new Date().toISOString(), results }, null, 2));

  await browser.close();
  console.log('Done. Results saved to', outPath);
})();
