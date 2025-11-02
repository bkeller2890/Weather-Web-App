// National Weather Service (NWS) API Constants

const NWS_API_BASE = "https://api.weather.gov/";
const NWS_USER_AGENT = "WeatherApp/v1.0 (b.keller2890@gmail.com)"; 

// OpenWeatherMap API Key and Base URLs

// Default API key (kept for local dev). It can be overridden by setting
// window.__OWM_API_KEY in the page (used by automated tests) so you don't
// have to bake a secret into source control.
let apiKey = "fca1ee0d8fe311426b14aae80fdb3c2d";
try {
    if (typeof window !== 'undefined' && window.__OWM_API_KEY) {
        apiKey = window.__OWM_API_KEY;
    }
} catch (e) {
    // ignore in non-browser contexts
}

const geoApiUrl = "https://api.openweathermap.org/geo/1.0/direct?limit=1&appid=" + apiKey + "&q="; 
const weatherApiUrl = "https://api.openweathermap.org/data/2.5/weather?units=imperial&appid=" + apiKey + "&";

// DOM Element Selectors - These are essential but not API constants
const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector("[data-search-btn]");
const locationBtn = document.querySelector("[data-location-btn]");
const savedCitiesContainer = document.querySelector(".saved-cities-container");
const weatherIcon = document.querySelector(".weather-icon");
const dailyForecastContainer = document.querySelector(".daily-forecast");
const hourlyForecastContainer = document.querySelector(".hourly-scroll-container");
const loadingIndicator = document.querySelector(".loading");

// Severe Weather Alert Banner DOM Element: 

// make sure that you have the HTML element with class 'severe-alert-banner' in your HTML file.

const severeAlertBanner = document.querySelector(".severe-alert-banner");

// Mappings for US States and Country Codes
// This is a simplified mapping. For a complete solution, consider using a library or API.  


const US_STATE_CODES = {
    "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
    "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "Florida": "FL", "Georgia": "GA",
    "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA",
    "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
    "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO",
    "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ",
    "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH",
    "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
    "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT", "Vermont": "VT",
    "Virginia": "VA", "Washington": "WA", "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY",
    "District of Columbia": "DC"
    // Note: The OpenWeatherMap 'state' field may include "District of Columbia" for DC searches.
};

// A more comprehensive country code to name mapping
// This is a simplified version. For a complete solution, consider using a library or API.

const COUNTRY_NAMES = {
    "AF": "Afghanistan", "AL": "Albania", "DZ": "Algeria", "AS": "American Samoa", "AD": "Andorra", 
    "AO": "Angola", "AI": "Anguilla", "AQ": "Antarctica", "AG": "Antigua and Barbuda", "AR": "Argentina", 
    "AM": "Armenia", "AW": "Aruba", "AU": "Australia", "AT": "Austria", "AZ": "Azerbaijan", 
    "BS": "Bahamas", "BH": "Bahrain", "BD": "Bangladesh", "BB": "Barbados", "BY": "Belarus", 
    "BE": "Belgium", "BZ": "Belize", "BJ": "Benin", "BM": "Bermuda", "BT": "Bhutan", 
    "BO": "Bolivia", "BA": "Bosnia and Herzegovina", "BW": "Botswana", "BR": "Brazil", "IO": "British Indian Ocean Territory", 
    "VG": "British Virgin Islands", "BN": "Brunei", "BG": "Bulgaria", "BF": "Burkina Faso", "BI": "Burundi", 
    "KH": "Cambodia", "CM": "Cameroon", "CA": "Canada", "CV": "Cape Verde", "KY": "Cayman Islands", 
    "CF": "Central African Republic", "TD": "Chad", "CL": "Chile", "CN": "China", "CX": "Christmas Island", 
    "CC": "Cocos [Keeling] Islands", "CO": "Colombia", "KM": "Comoros", "CK": "Cook Islands", "CR": "Costa Rica", 
    "HR": "Croatia", "CU": "Cuba", "CW": "Curaçao", "CY": "Cyprus", "CZ": "Czech Republic", 
    "CD": "Democratic Republic of the Congo", "DK": "Denmark", "DJ": "Djibouti", "DM": "Dominica", "DO": "Dominican Republic", 
    "TL": "East Timor", "EC": "Ecuador", "EG": "Egypt", "SV": "El Salvador", "GQ": "Equatorial Guinea", 
    "ER": "Eritrea", "EE": "Estonia", "ET": "Ethiopia", "FK": "Falkland Islands [Malvinas]", "FO": "Faroe Islands", 
    "FJ": "Fiji", "FI": "Finland", "FR": "France", "GF": "French Guiana", "PF": "French Polynesia", 
    "TF": "French Southern Territories", "GA": "Gabon", "GM": "Gambia", "GE": "Georgia", "DE": "Germany", 
    "GH": "Ghana", "GI": "Gibraltar", "GR": "Greece", "GL": "Greenland", "GD": "Grenada", 
    "GP": "Guadeloupe", "GU": "Guam", "GT": "Guatemala", "GG": "Guernsey", "GN": "Guinea", 
    "GW": "Guinea-Bissau", "GY": "Guyana", "HT": "Haiti", "HN": "Honduras", "HK": "Hong Kong", 
    "HU": "Hungary", "IS": "Iceland", "IN": "India", "ID": "Indonesia", "IR": "Iran", 
    "IQ": "Iraq", "IE": "Ireland", "IM": "Isle of Man", "IL": "Israel", "IT": "Italy", 
    "CI": "Ivory Coast", "JM": "Jamaica", "JP": "Japan", "JE": "Jersey", "JO": "Jordan", 
    "KZ": "Kazakhstan", "KE": "Kenya", "KI": "Kiribati", "KW": "Kuwait", "KG": "Kyrgyzstan", 
    "LA": "Laos", "LV": "Latvia", "LB": "Lebanon", "LS": "Lesotho", "LR": "Liberia", 
    "LY": "Libya", "LI": "Liechtenstein", "LT": "Lithuania", "LU": "Luxembourg", "MO": "Macao", 
    "MK": "Macedonia", "MG": "Madagascar", "MW": "Malawi", "MY": "Malaysia", "MV": "Maldives", 
    "ML": "Mali", "MT": "Malta", "MH": "Marshall Islands", "MQ": "Martinique", "MR": "Mauritania", 
    "MU": "Mauritius", "YT": "Mayotte", "MX": "Mexico", "FM": "Micronesia", "MD": "Moldova", 
    "MC": "Monaco", "MN": "Mongolia", "ME": "Montenegro", "MS": "Montserrat", "MA": "Morocco", 
    "MZ": "Mozambique", "MM": "Myanmar [Burma]", "NA": "Namibia", "NR": "Nauru", "NP": "Nepal", 
    "NL": "Netherlands", "NZ": "New Zealand", "NI": "Nicaragua", "NE": "Niger", "NG": "Nigeria", 
    "NU": "Niue", "NF": "Norfolk Island", "KP": "North Korea", "MP": "Northern Mariana Islands", "NO": "Norway", 
    "OM": "Oman", "PK": "Pakistan", "PW": "Palau", "PS": "Palestine", "PA": "Panama", 
    "PG": "Papua New Guinea", "PY": "Paraguay", "PE": "Peru", "PH": "Philippines", "PN": "Pitcairn Islands", 
    "PL": "Poland", "PT": "Portugal", "PR": "Puerto Rico", "QA": "Qatar", "CG": "Republic of the Congo", 
    "RE": "Réunion", "RO": "Romania", "RU": "Russia", "RW": "Rwanda", "BL": "Saint Barthélemy", 
    "SH": "Saint Helena", "KN": "Saint Kitts and Nevis", "LC": "Saint Lucia", "MF": "Saint Martin", "PM": "Saint Pierre and Miquelon", 
    "VC": "Saint Vincent and the Grenadines", "WS": "Samoa", "SM": "San Marino", "ST": "São Tomé and Príncipe", "SA": "Saudi Arabia", 
    "SN": "Senegal", "RS": "Serbia", "SC": "Seychelles", "SL": "Sierra Leone", "SG": "Singapore", 
    "SX": "Sint Maarten", "SK": "Slovakia", "SI": "Slovenia", "SB": "Solomon Islands", "SO": "Somalia", 
    "ZA": "South Africa", "KR": "South Korea", "SS": "South Sudan", "ES": "Spain", "LK": "Sri Lanka", 
    "SD": "Sudan", "SR": "Suriname", "SJ": "Svalbard and Jan Mayen", "SZ": "Swaziland", "SE": "Sweden", 
    "CH": "Switzerland", "SY": "Syria", "TW": "Taiwan", "TJ": "Tajikistan", "TZ": "Tanzania", 
    "TH": "Thailand", "TG": "Togo", "TK": "Tokelau", "TO": "Tonga", "TT": "Trinidad and Tobago", 
    "TN": "Tunisia", "TR": "Turkey", "TM": "Turkmenistan", "TC": "Turks and Caicos Islands", "TV": "Tuvalu", 
    "VI": "U.S. Virgin Islands", "UG": "Uganda", "UA": "Ukraine", "AE": "United Arab Emirates", "GB": "United Kingdom", 
    "US": "United States", "UY": "Uruguay", "UZ": "Uzbekistan", "VU": "Vanuatu", "VA": "Vatican City", 
    "VE": "Venezuela", "VN": "Vietnam", "WF": "Wallis and Futuna", "EH": "Western Sahara", "YE": "Yemen", 
    "ZM": "Zambia", "ZW": "Zimbabwe"
};

// Example JavaScript structure for showing the weather

function displayWeather(data) {
    // 1. Add the 'expanded' class to the card for widening
    document.querySelector(".card").classList.add("expanded");

    // 2. Add the 'active' class to the weather container to show the data
    document.querySelector(".weather").classList.add("active");

    // ... (Your code to populate temp, city, etc. goes here) ...
}

// New function to handle geolocation
function getCurrentLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                // Call checkWeather with coordinates instead of a city name
                checkWeather(null, lat, lon);
            },
            (error) => {
                // Handle errors like user denying permission
                document.querySelector(".error").innerHTML = "Geolocation access denied or unavailable.";
                document.querySelector(".error").style.display = "block";
            }
        );
    } else {
        document.querySelector(".error").innerHTML = "Geolocation not supported by this browser.";
        document.querySelector(".error").style.display = "block";
    }
}

// Function to handle clicks on the saved cities container
function handleSavedCityClick(event) {
    const target = event.target;
    if(target.classList.contains('delete-city-btn')){
        const cityName = target.getAttribute('data-city-name');
        if(cityName){
            deleteCity(cityName);
        }
        return; 
    }

    const cityTagElement = target.closest('.saved-city-tag');
    const cityNameLink = target.closest('.city-name-link');

    if (cityNameLink) {
        const cityName = cityNameLink.getAttribute('data-city-name');
        if (cityName) {
            searchBox.value = cityName;
            checkWeather(cityName);
        }
    }
}

function handleSearchError() {
    // Optional: If you want the card to shrink back on error
    document.querySelector(".card").classList.remove("expanded");
    document.querySelector(".weather").classList.remove("active");
    // ... (Show error message) ...
}

// Helper function to map weather condition to your image paths

// needed: few clouds, scattered clouds, broken clouds, overcast
// need variety for different cloud conditions

/**
 * NWS Step 1 & 2: Fetches NWS Grid ID and then fetches active alerts for that location.
 * Now processes all alerts, including Special Weather Statements (SPS) and Marine Alerts.
 * @param {number} lat - Latitude of the location.
 * @param {number} lon - Longitude of the location.
 */
async function handleNwsAlerts(lat, lon) {
    // 1. Clear previous alerts and hide the banner
    if (!severeAlertBanner) return;
    severeAlertBanner.innerHTML = '';
    severeAlertBanner.style.display = 'none'; // Will only display if alerts are found

    try {
        // Step 1: Get Grid Point and Zone
        const pointsUrl = `${NWS_API_BASE}/points/${lat},${lon}`;
        const pointsResponse = await fetch(pointsUrl, { headers: { 'User-Agent': NWS_USER_AGENT } });
        if (!pointsResponse.ok) throw new Error("Failed to get NWS grid point.");
        
        const pointsData = await pointsResponse.json();
        const forecastZone = pointsData.properties.forecastZone.split('/').pop();

        // FIX 1: Correct the property name for marine zone.
        const marineZoneURL = pointsData.properties.marineForecastZone; 
        let marineZone = null;
        if (marineZoneURL){
            marineZone = marineZoneURL.split('/').pop();
        }

        let alertHTML = ''; // Accumulator for all alert HTML

        // --- Step 2A: Fetch Land Alerts (Warnings, Watches, SPS) ---
        const alertsUrl = `${NWS_API_BASE}/alerts/active/zone/${forecastZone}`;
        const alertsResponse = await fetch(alertsUrl, { headers: { 'User-Agent': NWS_USER_AGENT } });

        if (alertsResponse.ok) {
            const alertsData = await alertsResponse.json();
            const activeAlerts = alertsData.features;
            
            if (activeAlerts.length > 0) {
                activeAlerts.forEach(feature => {
                    const alert = feature.properties;
                    const headline = alert.event;
                    const description = alert.description.substring(0, 300) + '...';
                    const severity = alert.severity;
                    
                    let icon = '🚨';
                    let classModifier = 'severe';
                    
                    if (headline.includes('Warning') || headline.includes('Watch') || headline.includes('Advisory')) {
                        icon = '⚠️';
                    }
                    
                    // Identify Special Weather Statements (SPS)
                    if (headline.includes('Special Weather Statement')) {
                        icon = '📣';
                        classModifier = 'statement';
                    }
                    
                    alertHTML += `
                        <div class="alert-item ${classModifier}">
                            <p class="alert-headline"><span class="emoji">${icon}</span> **${headline}**</p>
                            <p class="alert-description">${description}</p>
                            <p class="alert-severity">Severity: ${severity}</p>
                        </div>
                        <hr class="alert-divider">
                    `;
                });
                
                // >>> NOTE: No UI update here yet, just appending to alertHTML <<<
            }
        } else {
             console.warn("Failed to fetch land-based NWS alerts.");
        }


        // --- Step 2B: Fetch Marine Alerts (Small Craft Advisory) ---
        if (marineZone) {
            // Note: Using 'zone' parameter for marine zone ID and filtering by event
            const marineAlertsUrl = `${NWS_API_BASE}/alerts/active?zone=${marineZone}&event=Small%20Craft%20Advisory`;
            const marineAlertsResponse = await fetch(marineAlertsUrl, { headers: { 'User-Agent': NWS_USER_AGENT } });

            if (marineAlertsResponse.ok) {
                const marineAlertsData = await marineAlertsResponse.json();
                const marineAlerts = marineAlertsData.features;

                if (marineAlerts.length > 0) {
                    marineAlerts.forEach(feature => {
                        const alert = feature.properties;
                        const headline = alert.event; // "Small Craft Advisory"
                        const description = alert.description.substring(0, 300) + '...';
                        const severity = alert.severity; 
                        
                        let icon = '🛥️'; 
                        let classModifier = 'marine'; 
                        
                        alertHTML += `
                            <div class="alert-item ${classModifier}">
                                <p class="alert-headline"><span class="emoji">${icon}</span> **${headline}**</p>
                                <p class="alert-description">${description}</p>
                                <p class="alert-severity">Severity: ${severity}</p>
                            </div>
                            <hr class="alert-divider">
                        `;
                    });
                    // >>> NOTE: No UI update here yet, just appending to alertHTML <<<
                }
            }
        }
        
        // --- Step 3: Final UI Update ---
        if (alertHTML) {
            severeAlertBanner.innerHTML = alertHTML;
            severeAlertBanner.style.display = 'block';
        }

    } catch (error) {
        console.error("NWS Alert Fatal Error:", error.message);
        // Fail silently or show a generic message for alert errors
    }
}



function getWeatherIcon(condition) {
    switch (condition) {
        case "Clouds": return "images/cloudy.png";
        case "Clear": return "images/clear.png";
        case "Rain": return "images/rain.png";
        case "Drizzle": return "images/drizzle.png";
        case "Mist": return "images/mist.png";
        case "Smoke":return "images/smoke.png";
        case "Haze": return "images/haze.png";
        case "Fog": return "images/mist.png";
        case "Snow": return "images/snow.png";
        case "Thunderstorm": return "images/thunderstorm.png";
        case "Sand": return "images/sand.png";
        case "Dust": return "images/dust.png";
        case "Ash": return "images/ash.png";
        case "Squall": return "images/squall.png";
        case "Tornado": return "images/tornado.png";
        default: return "images/clear.png";
    }
}

function displayForecasts(data) {
    hourlyForecastContainer.innerHTML = ''; // Clear old content
    // Keep the outer container intact (don't overwrite inner `.daily-scroll-container` element)
    if (dailyForecastContainer) {
        const header = dailyForecastContainer.querySelector('h3');
        if (!header) {
            const h = document.createElement('h3');
            h.textContent = '7-Day Forecast';
            dailyForecastContainer.insertBefore(h, dailyForecastContainer.firstChild);
        }
    }

    const hourlyList = data.list.slice(0, 8); // Take the next 8 intervals (24 hours)
    const dailyMap = new Map(); // Use a map to get one entry per day

    // --- Hourly Forecast Logic ---
    hourlyList.forEach(item => {
        const date = new Date(item.dt * 1000);
        const hour = date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
        const temp = Math.round(item.main.temp);
        const iconSrc = getWeatherIcon(item.weather[0].main);

        const hourlyItemHTML = `
            <div class="hourly-item">
                <p class="hour">${hour}</p>
                <img src="${iconSrc}" alt="${item.weather[0].description} icon">
                <p class="hourly-temp">${temp}&deg;</p>
            </div>
        `;
        hourlyForecastContainer.innerHTML += hourlyItemHTML;
    });

    // --- Daily Forecast Logic ---
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toLocaleDateString('en-US', { weekday: 'short' });

        // Only process data for noon (12:00) to represent the day's average/peak
        // or just use the first entry of the day, making sure we don't duplicate days.
        const timeOfDay = date.getHours();
        
        if (timeOfDay >= 12 && timeOfDay < 15 && !dailyMap.has(dayKey)) {
             dailyMap.set(dayKey, { 
                day: dayKey, 
                temp: Math.round(item.main.temp),
                iconSrc: getWeatherIcon(item.weather[0].main)
            });
        }
    });

    // Simple approach: Iterate through all 5-day forecast entries and grab high/low per unique day
    const dayData = {}; // Object to store { "Mon": { hi: 0, lo: 999 } }
    
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(item.main.temp_max); // Use max/min for better daily range

        if (!dayData[dayKey]) {
            dayData[dayKey] = { hi: temp, lo: temp, iconSrc: getWeatherIcon(item.weather[0].main) };
        } else {
            dayData[dayKey].hi = Math.max(dayData[dayKey].hi, temp);
            dayData[dayKey].lo = Math.min(dayData[dayKey].lo, Math.round(item.main.temp_min));
        }
    });

    // Insert 7 daily cards (today + next 6). Use dayData when available, otherwise fall back to dailyMap or placeholder.
    const dailyScroll = document.querySelector('.daily-scroll-container');
    if (dailyScroll) {
        dailyScroll.innerHTML = '';
    }

    const today = new Date();
    const next7 = Array.from({ length: 7 }, (_, i) => new Date(today.getTime() + i * 86400000))
        .map(d => d.toLocaleDateString('en-US', { weekday: 'short' }));

    next7.forEach(dayKey => {
        let day = dayData[dayKey] || (dailyMap.has(dayKey) ? dailyMap.get(dayKey) : null);

        if (!day) {
            // Placeholder if we don't have data for this day
            day = { day: dayKey, hi: '--', lo: '--', iconSrc: 'images/clear.png' };
        }

        const hiText = (typeof day.hi === 'number') ? `${day.hi}` : day.hi;
        const loText = (typeof day.lo === 'number') ? `${day.lo}` : day.lo;

        const dailyItemHTML = `
            <div class="daily-item">
                <p class="day">${dayKey}</p>
                <img src="${day.iconSrc}" alt="Weather icon">
                <p class="daily-temps">Hi ${hiText}&deg;<br>Lo ${loText}&deg;</p>
            </div>
        `;

        if (dailyScroll) dailyScroll.innerHTML += dailyItemHTML;
    });
}

/**
 * Renders 7-day forecast from One Call API data into the .daily-scroll-container
 * @param {Object} oneCallData - The One Call API JSON response
 */
function displayDailyOneCall(oneCallData) {
    if (!oneCallData || !oneCallData.daily) return;

    const dailyScroll = document.querySelector('.daily-scroll-container');
    if (!dailyScroll) return;

    dailyScroll.innerHTML = ''; // clear previous

    // Take up to 7 days (One Call returns today + 7)
    const days = oneCallData.daily.slice(0, 7);

    days.forEach(d => {
        const date = new Date(d.dt * 1000);
        const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateLabel = date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
        const hi = Math.round(d.temp.max);
        const lo = Math.round(d.temp.min);
        const precip = (typeof d.pop === 'number') ? Math.round(d.pop * 100) : null;
        const iconMain = (d.weather && d.weather[0] && d.weather[0].main) ? d.weather[0].main : 'Clear';
        const iconSrc = getWeatherIcon(iconMain);

        const precipHtml = precip !== null ? `<p class="precip">${precip}%</p>` : '';

        const sunrise = d.sunrise ? new Date(d.sunrise * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '';
        const sunset = d.sunset ? new Date(d.sunset * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '';

        const html = `
            <div class="daily-item">
                <p class="day">${dayLabel}</p>
                <p class="date">${dateLabel}</p>
                <img src="${iconSrc}" alt="${iconMain} icon">
                <p class="daily-temps">Hi ${hi}°<br>Lo ${lo}°</p>
                ${precipHtml}
                <p class="sun">☀️ ${sunrise} / 🌙 ${sunset}</p>
            </div>
        `;

        dailyScroll.innerHTML += html;
    });
}

// NEW: LocalStorage Functions for Saved Cities
// ----------------------------------------------------

// Layout preference: stack vs cards
function getLayoutPref() {
    try { return localStorage.getItem('layoutPref') || 'stack'; } catch (e) { return 'stack'; }
}

function setLayoutPref(pref) {
    try { localStorage.setItem('layoutPref', pref); } catch (e) {}
}

function applyLayout() {
    const pref = getLayoutPref();
    const weatherEl = document.querySelector('.weather');
    if (!weatherEl) return;
    if (pref === 'stack') {
        weatherEl.classList.add('stack-vertical');
    } else {
        weatherEl.classList.remove('stack-vertical');
    }
    const toggle = document.getElementById('layout-toggle');
    if (toggle) {
        const pressed = pref === 'stack';
        toggle.setAttribute('aria-pressed', pressed ? 'true' : 'false');
        toggle.textContent = pressed ? 'Stack' : 'Cards';
    }
}

// Wire up the layout toggle button when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    applyLayout();
    const btn = document.getElementById('layout-toggle');
    if (btn) {
        btn.addEventListener('click', () => {
            const current = getLayoutPref();
            const next = current === 'stack' ? 'cards' : 'stack';
            setLayoutPref(next);
            applyLayout();
        });
    }
    // wire up One Call toast actions
    const retryBtn = document.getElementById('onecall-retry');
    const closeBtn = document.getElementById('onecall-close');
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            const toast = document.getElementById('onecall-toast');
            if (toast) toast.style.display = 'none';
            // attempt to re-run One Call for the currently displayed location
            const cityText = document.querySelector('.city') ? document.querySelector('.city').textContent : null;
            if (cityText) {
                // trigger checkWeather using the shown city name
                checkWeather(cityText);
            }
        });
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            const toast = document.getElementById('onecall-toast');
            if (toast) toast.style.display = 'none';
        });
    }

    // --- Runtime API Key Override UI Wiring ---
    const keyInput = document.getElementById('owm-key-input');
    const keySave = document.getElementById('owm-key-save');
    const keyClear = document.getElementById('owm-key-clear');
    const keyIndicator = document.getElementById('owm-key-indicator');

    function updateKeyIndicator() {
        const k = (() => { try { return localStorage.getItem('owm_key_override'); } catch (e) { return null; } })();
        if (k) {
            keyIndicator.textContent = 'Override active';
            keyIndicator.classList.add('active');
            if (keyInput) keyInput.value = k;
            try { window.__OWM_API_KEY = k; apiKey = k; } catch (e) {}
        } else {
            keyIndicator.textContent = '';
            keyIndicator.classList.remove('active');
            if (keyInput) keyInput.value = '';
            try { if (window.__OWM_API_KEY) delete window.__OWM_API_KEY; } catch (e) {}
            // Reset apiKey to default baked-in value (left as original variable)
            apiKey = apiKey || apiKey;
        }
    }

    // Load persisted override on start
    updateKeyIndicator();

    if (keySave) {
        keySave.addEventListener('click', () => {
            const val = keyInput ? keyInput.value.trim() : '';
            if (!val) return;
            try { localStorage.setItem('owm_key_override', val); } catch (e) {}
            try { window.__OWM_API_KEY = val; apiKey = val; } catch (e) {}
            updateKeyIndicator();
        });
    }

    if (keyClear) {
        keyClear.addEventListener('click', () => {
            try { localStorage.removeItem('owm_key_override'); } catch (e) {}
            try { delete window.__OWM_API_KEY; } catch (e) {}
            // reload the page to ensure all fetch URL strings re-evaluate if needed
            updateKeyIndicator();
        });
    }
});

/**
 * Retrieves the list of saved cities from localStorage.
 * @returns {Array} An array of city names.
 */
function getSavedCities() {
    // Retrieve the JSON string, or '[]' if nothing is saved yet
    const citiesJson = localStorage.getItem('savedCities');
    return citiesJson ? JSON.parse(citiesJson) : [];
}

/**
 * Renders the saved city tags in the UI.
 */
function renderSavedCities() {
    const cities = getSavedCities();
    if (!savedCitiesContainer) return; // Safety check
    savedCitiesContainer.innerHTML = ''; // Clear existing tags

    cities.forEach(city => {
        const tag = document.createElement('span');
        tag.classList.add('saved-city-tag');
        // Use the data attribute for the JS click handler

        // 1. City Name Span (Clickable to SEARCH)
        const nameSpan = document.createElement('span');
        nameSpan.textContent = city;
        nameSpan.setAttribute('data-city-name', city);
        nameSpan.classList.add('city-name-link'); // New class to distinguish the clickable name
        
        // 2. Delete Button Span (Clickable to DELETE)
        const deleteBtn = document.createElement('span');
        deleteBtn.innerHTML = '&#x2715;'; // Unicode '✕' (HEAVY MULTIPLICATION X)
        deleteBtn.classList.add('delete-city-btn');
        deleteBtn.setAttribute('data-city-name', city);


        tag.appendChild(nameSpan);
        tag.appendChild(deleteBtn);
        savedCitiesContainer.appendChild(tag);
    });
}

/**
 * Saves a new city name to localStorage, ensuring no duplicates and a maximum list size.
 * @param {string} cityName - The name of the city to save (e.g., "New York").
 */
function saveCity(cityName) {
    let cities = getSavedCities();
    
    // 1. Sanitize input (optional: convert to Title Case for consistent display)
    const normalizedCity = cityName.trim().replace(/\b\w/g, l => l.toUpperCase());

    // 2. Remove the city if it already exists (to push it to the front/top)
    cities = cities.filter(c => c !== normalizedCity);

    // 3. Add the new city to the beginning of the array
    cities.unshift(normalizedCity);

    // 4. Limit the number of saved cities (e.g., max 5)
    const maxCities = 5;
    if (cities.length > maxCities) {
        cities = cities.slice(0, maxCities);
    }
    
    // 5. Save the updated list back to localStorage
    localStorage.setItem('savedCities', JSON.stringify(cities));

    // 6. Update the UI
    renderSavedCities();
}

// ----------------------------------------------------
// END NEW: LocalStorage Functions

/**
 * Deletes a specified city from localStorage and updates the UI.
 * @param {string} cityName - The name of the city to delete.
 */
function deleteCity(cityName) {
    let cities = getSavedCities();
    
    // Normalize the city name for comparison
    const normalizedCity = cityName.trim().replace(/\b\w/g, l => l.toUpperCase());
    
    // Filter out the city to be deleted
    cities = cities.filter(c => c !== normalizedCity);
    
    // Save the updated list back to localStorage
    localStorage.setItem('savedCities', JSON.stringify(cities));
    
    // Update the UI
    renderSavedCities();
}

// Function signature: input is for text search, lat/lon for coordinate search
async function checkWeather(input, lat = null, lon = null) {
    document.querySelector(".weather").classList.remove("active");
    document.querySelector(".error").style.display = "none";

    if(loadingIndicator){
        loadingIndicator.style.display = "block";
    }

    let locationName, stateName = null, countryCode; // 🎯 FIX 1: Declare location variables here

    // --- PART 1: Determine Coordinates and Location Details (Geocoding / Reverse Geocoding) ---
    
    if (lat === null || lon === null) {
        // --- 1A: Standard Geocoding (City/Zip Input) ---
        const trimmedInput = input.trim();
        if (!trimmedInput) return;

        let geoResponse;
    
        // Check for Zip Code (5 digits)
        if (/^\d{5}$/.test(trimmedInput)) {
            // Use the Geocoding API's ZIP endpoint
            const zipGeoUrl = `https://api.openweathermap.org/geo/1.0/zip?zip=${trimmedInput},us&appid=${apiKey}`;
            geoResponse = await fetch(zipGeoUrl);
        } else {
            let locationString = trimmedInput;
            const parts = trimmedInput.split(',');
            if (parts.length === 2 && parts[1].trim().length === 2) {
                locationString += ',US';
            }
            const encodedInput = encodeURIComponent(locationString);
            const cityGeoUrl = geoApiUrl + encodedInput; // geoApiUrl needs to be defined
            geoResponse = await fetch(cityGeoUrl);
        }
    
        if (geoResponse.status === 404) {
            document.querySelector(".error").style.display = "block";
            document.querySelector(".city").innerHTML = "Location Not Found";
            return; 
        }
    
        let geoData = await geoResponse.json();
        let locationData = Array.isArray(geoData) ? geoData[0] : geoData;

        if (!locationData) {
            document.querySelector(".error").style.display = "block";
            document.querySelector(".city").innerHTML = "Location Not Found";
            
            if (loadingIndicator) {
                loadingIndicator.style.display = "none";
            }
            return; 
        }

        // Initialize variables from the geocoding response
        lat = locationData.lat;
        lon = locationData.lon;
        locationName = locationData.name;
        countryCode = locationData.country;
        
        if (locationData.state && countryCode === 'US') {
            stateName = locationData.state;
        }
    } else {
        // --- 1B: Reverse Geocoding (Lat/Lon Input) ---
       
        const reverseGeoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
        const reverseResponse = await fetch(reverseGeoUrl);

        if (reverseResponse.status !== 200) {
            console.error("Reverse geocoding failed.");
            // We can continue to fetch weather but location display will be generic
        } else {
            const reverseData = await reverseResponse.json();
            if (reverseData.length > 0) {
                const locationData = reverseData[0];
                locationName = locationData.name;
                countryCode = locationData.country;
                if (locationData.state && countryCode === 'US') {
                    stateName = locationData.state;
                }
            } else {
                 // Fallback if reverse geocoding returns no results
                 locationName = "Your Location";
                 countryCode = null;
            }
        }
    }


    // --- PART 2: Fetch Current Weather & Forecasts using Coordinates (Now guaranteed to have lat/lon) ---
    const fullWeatherUrl = `${weatherApiUrl}lat=${lat}&lon=${lon}`;
    const weatherResponse = await fetch(fullWeatherUrl);
    
    // Make sure your forecast URL uses the apiKey variable correctly.
    const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?units=imperial&lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const forecastResponse = await fetch(forecastApiUrl);

    if (forecastResponse.status !== 200) {
        console.error("Forecast data unavailable");
    } else {
        const forecastData = await forecastResponse.json();
        // Assuming displayForecasts function is correctly defined elsewhere
        displayForecasts(forecastData); 
    }

    // Fetch 7-day daily forecast using One Call API and render it
    try {
        const oneCallUrl = `https://api.openweathermap.org/data/2.5/onecall?units=imperial&lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${apiKey}`;
        const oneCallResp = await fetch(oneCallUrl);
        const dailyFallbackEl = document.querySelector('.daily-fallback');
        if (oneCallResp.ok) {
            const oneCallData = await oneCallResp.json();
            // Render 7-day daily forecast (if function exists below)
            if (typeof displayDailyOneCall === 'function') {
                displayDailyOneCall(oneCallData);
            }
            if (dailyFallbackEl) dailyFallbackEl.style.display = 'none';
        } else {
            console.warn('OneCall daily data unavailable:', oneCallResp.status);
            if (dailyFallbackEl) dailyFallbackEl.style.display = 'block';
            const toast = document.getElementById('onecall-toast');
            if (toast) {
                const msg = toast.querySelector('.onecall-msg');
                if (msg) msg.textContent = `Detailed daily data unavailable (code ${oneCallResp.status}).`;
                toast.style.display = 'flex';
            }
        }
    } catch (e) {
        console.warn('OneCall fetch error:', e.message);
        const dailyFallbackEl = document.querySelector('.daily-fallback');
        if (dailyFallbackEl) dailyFallbackEl.style.display = 'block';
        const toast = document.getElementById('onecall-toast');
        if (toast) {
            const msg = toast.querySelector('.onecall-msg');
            if (msg) msg.textContent = `Detailed daily data unavailable (error).`;
            toast.style.display = 'flex';
        }
    }

    // Handle NWS Severe Weather Alerts
    if(countryCode === 'US') {
        handleNwsAlerts(lat, lon);   
    }
    else{
        if (severeAlertBanner) {
            severeAlertBanner.innerHTML = '';
            severeAlertBanner.style.display = 'none';
        }
    }
    
    if (weatherResponse.status !== 200) {
        document.querySelector(".error").style.display = "block";
        document.querySelector(".city").innerHTML = "Weather Data Unavailable";
        if (loadingIndicator){
            loadingIndicator.style.display = "none";
        }
        return;
    }

    let weatherData = await weatherResponse.json();


    // --- PART 3: Display Data (Relies on initialized locationName, stateName, countryCode) ---
    
    // 🔑 NEW: Save the city name after successful data fetch and before displaying
    if (locationName && locationName !== "Coordinates" && locationName !== "Your Location") {
        saveCity(locationName);
    }

    // Construct the Location Display:
    // 🎯 FIX 3: Initialize locationDisplay properly, especially for the Geolocation case.
    // If locationName is undefined (due to reverse geocoding failure), set a default.
    let locationDisplay = locationName || "Coordinates"; 
    
    if (stateName) {
        // ... (Keep your existing display logic for US state codes) ...
        const stateCode = US_STATE_CODES[stateName]
        if (stateCode){
            locationDisplay = `${locationName}, ${stateCode}`;
        }else{
            locationDisplay = `${locationName}, ${stateName}`;
        }
       
    } else if (countryCode && countryCode !== 'US') {
        // ... (Keep your existing display logic for international country names) ...
        const countryName = COUNTRY_NAMES[countryCode]

        if (countryName){
            locationDisplay = `${locationName}, ${countryName}`;
        }else{
            locationDisplay = `${locationName}, ${countryCode}`;
        }
    }

    // ... (rest of the display logic) ...
    document.querySelector(".city").innerHTML = locationDisplay;
    document.querySelector(".temp").innerHTML = Math.round(weatherData.main.temp) + "°F";
    document.querySelector(".humidity").innerHTML = weatherData.main.humidity + "%";
    document.querySelector(".wind").innerHTML = weatherData.wind.speed + " mph"; 

    // ====================================================
    // *** NEW LOGIC FOR DYNAMIC ICON CHANGE ***
    // ====================================================
    const weatherCondition = weatherData.weather[0].main;
    
    // needed, few clouds, scattered clouds, broken clouds, overcast
    // need variety for different cloud conditions

    switch (weatherCondition) {
        case "Clouds":
            weatherIcon.src = "images/cloudy.png";
            break;
        case "Clear":
            weatherIcon.src = "images/clear.png";
            break;
        case "Rain":
            weatherIcon.src = "images/rain.png";
            break;
        case "Drizzle":
            weatherIcon.src = "images/drizzle.png";
            break;
        case "Mist":
            weatherIcon.src = "images/mist.png";
            break; 
        case "Smoke":
            weatherIcon.src = "images/smoke.png"; 
            break; 
        case "Haze":
            weatherIcon.src = "images/haze.png"; 
            break;
        case "Fog":
            weatherIcon.src = "images/fog.png"; 
            break;
        case "Snow":
            weatherIcon.src = "images/snow.png";
            break;
        case "Thunderstorm":
            weatherIcon.src = "images/thunderstorm.png";
            break;

        case "Sand":
            weatherIcon.src = "images/sand.png";
            break; 
        case "Dust":
            weatherIcon.src = "images/dust.png";
            break;
        case "Ash":
            weatherIcon.src = "images/ash.png";
            break;
        case "Squall":
            weatherIcon.src = "images/squall.png";
            break;
        case "Tornado":
            weatherIcon.src = "images/tornado.png";
            break;
        default:
            // Fallback for unknown conditions
            weatherIcon.src = "images/clear.png";
            break; 
    }
   // ====================================================

    // --- PART 4: Final UI Updates ---
    document.querySelector(".error").style.display = "none";
    document.querySelector(".weather").classList.add("active");
    
    if(loadingIndicator){
        loadingIndicator.style.display = "none";
    } 

}



searchBtn.addEventListener("click", () => {
    checkWeather(searchBox.value);
});

// NEW: Add listener for the Enter key on the input box
searchBox.addEventListener("keydown", (event) => {
    // KeyCode 13 is the Enter key (legacy)
    // 'key' property is the modern standard
    if (event.key === 'Enter' || event.keyCode === 13) {
        event.preventDefault(); 
        checkWeather(searchBox.value);
    }
});

// Attach the listener to the new location button
locationBtn.addEventListener("click", getCurrentLocationWeather);

// Attach the listener
savedCitiesContainer.addEventListener('click', handleSavedCityClick);

// NEW: Load saved cities when the script starts

renderSavedCities();