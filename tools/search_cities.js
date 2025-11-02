// Quick program to search cities and print concise weather + NWS alerts
// Usage: run with `node tools/search_cities.js`

const fetch = global.fetch || require('node-fetch');

const apiKey = "fca1ee0d8fe311426b14aae80fdb3c2d"; // copied from script.js
const NWS_USER_AGENT = "WeatherApp/v1.0 (b.keller2890@gmail.com)";

const cities = [
  { q: 'Dallas,TX,US', label: 'Dallas, TX' },
  { q: 'Indianapolis,IN,US', label: 'Indianapolis, IN' },
  { q: 'New York,NY,US', label: 'New York, NY' },
  { q: 'Cleveland,OH,US', label: 'Cleveland, OH' },
];

async function geocode(q) {
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=1&appid=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocode failed: ${res.status}`);
  const data = await res.json();
  return data[0];
}

async function currentWeather(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?units=imperial&lat=${lat}&lon=${lon}&appid=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather failed: ${res.status}`);
  return res.json();
}

async function forecast(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?units=imperial&lat=${lat}&lon=${lon}&appid=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Forecast failed: ${res.status}`);
  return res.json();
}

async function nwsAlerts(lat, lon) {
  try {
    const pointsUrl = `https://api.weather.gov/points/${lat},${lon}`;
    const pointsRes = await fetch(pointsUrl, { headers: { 'User-Agent': NWS_USER_AGENT } });
    if (!pointsRes.ok) return { alerts: [] };
    const pointsData = await pointsRes.json();
    const zone = pointsData.properties.forecastZone.split('/').pop();
    const alertsUrl = `https://api.weather.gov/alerts/active/zone/${zone}`;
    const alertsRes = await fetch(alertsUrl, { headers: { 'User-Agent': NWS_USER_AGENT } });
    if (!alertsRes.ok) return { alerts: [] };
    const alertsData = await alertsRes.json();
    return { alerts: alertsData.features.map(f => f.properties) };
  } catch (e) {
    return { alerts: [] };
  }
}

(async () => {
  for (const c of cities) {
    try {
      console.log('---');
      console.log(c.label);
      const loc = await geocode(c.q);
      if (!loc) {
        console.log('  Geocode: not found');
        continue;
      }
      const lat = loc.lat;
      const lon = loc.lon;
      const name = loc.name || c.label;
      const country = loc.country;
      console.log(`  Location: ${name}, ${loc.state || ''} ${country} (${lat.toFixed(4)}, ${lon.toFixed(4)})`);

      const w = await currentWeather(lat, lon);
      console.log(`  Temp: ${Math.round(w.main.temp)}°F  Humidity: ${w.main.humidity}%  Wind: ${w.wind.speed} mph  Condition: ${w.weather[0].main}`);

      const f = await forecast(lat, lon);
      // simple next forecast timestamp and temp
      if (f && f.list && f.list.length) {
        const next = f.list[0];
        const dt = new Date(next.dt * 1000).toLocaleString();
        console.log(`  Next forecast: ${dt}  Temp: ${Math.round(next.main.temp)}°F  Condition: ${next.weather[0].main}`);
      }

      // NWS alerts for US only
      if (country === 'US') {
        const na = await nwsAlerts(lat, lon);
        if (na.alerts.length === 0) {
          console.log('  NWS Alerts: none');
        } else {
          console.log(`  NWS Alerts: ${na.alerts.length}`);
          na.alerts.slice(0,3).forEach(a => console.log(`    - ${a.event} (${a.severity})`));
        }
      } else {
        console.log('  NWS Alerts: n/a (not US)');
      }

    } catch (err) {
      console.log('  Error:', err.message);
    }
  }
})();
