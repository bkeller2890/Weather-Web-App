const https = require('https');
const url = require('url');

if (process.argv.length < 3) {
  console.error('Usage: node check_onecall_key.js <API_KEY> [lat] [lon]');
  process.exit(2);
}

const apiKey = process.argv[2];
const lat = process.argv[3] || '40.7128';
const lon = process.argv[4] || '-74.0060';

const onecall = `https://api.openweathermap.org/data/2.5/onecall?units=imperial&lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${apiKey}`;

console.log('Requesting:', onecall);

const parsed = url.parse(onecall);

const opts = {
  hostname: parsed.hostname,
  path: parsed.path,
  method: 'GET',
  headers: {
    'User-Agent': 'WeatherApp-KeyCheck/1.0'
  }
};

const req = https.request(opts, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  let body = '';
  res.setEncoding('utf8');
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Body:', body.slice(0, 8000));
  });
});

req.on('error', (e) => console.error('Request error:', e.message));
req.end();
