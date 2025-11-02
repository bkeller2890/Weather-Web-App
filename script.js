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

// NOTE: geoApiUrl and weatherApiUrl are now constructed DYNAMICALLY
// within checkWeather to ensure they use the correct apiKey value.

// DOM Element Selectors - These are essential but not API constants
const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector("[data-search-btn]");
const locationBtn = document.querySelector("[data-location-btn]");
const savedCitiesContainer = document.querySelector(".saved-cities-container");
const weatherIcon = document.querySelector(".weather-icon");
// Note: dailyForecastContainer is the wrapper. We target the inner scroller in logic.
const dailyForecastContainer = document.querySelector(".daily-forecast"); 
const hourlyForecastContainer = document.querySelector(".hourly-scroll-container");
const loadingIndicator = document.querySelector(".loading");

// Severe Weather Alert Banner DOM Element: 
const severeAlertBanner = document.querySelector(".severe-alert-banner");

// Mappings for US States and Country Codes (simplified for brevity)
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
};

// A more comprehensive country code to name mapping (simplified for brevity)
const COUNTRY_NAMES = {
    "US": "United States", "CA": "Canada", "MX": "Mexico", "GB": "United Kingdom", "DE": "Germany", 
    "FR": "France", "JP": "Japan", "AU": "Australia", "CN": "China", "IN": "India", 
    // Add other codes as needed
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
        // Show loading indicator before requesting permission
        if (loadingIndicator) loadingIndicator.style.display = "block";
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                // Call checkWeather with coordinates instead of a city name
                checkWeather(null, lat, lon);
            },
            (error) => {
                // Hide loading and handle errors like user denying permission
                if (loadingIndicator) loadingIndicator.style.display = "none";
                
                let message = "Geolocation access denied or unavailable.";
                if (error.code === error.PERMISSION_DENIED) {
                    message = "Geolocation permission denied. Please allow location access to use this feature.";
                }
                
                document.querySelector(".error").innerHTML = message;
                document.querySelector(".error").style.display = "block";
                
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 } // High accuracy, fast timeout
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
        
        // NWS only covers US territories, so fail silently if not in the US.
        if (!pointsResponse.ok) {
             console.warn("NWS API failed, likely outside the US or connection error.");
             return;
        }
        
        const pointsData = await pointsResponse.json();
        const forecastZone = pointsData.properties.forecastZone.split('/').pop();
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
                    // Truncate description for display
                    const description = alert.description.substring(0, 300) + (alert.description.length > 300 ? '...' : ''); 
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
                        const description = alert.description.substring(0, 300) + (alert.description.length > 300 ? '...' : '');
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

/**
 * Fallback function to display 5-day / 3-hour forecast data.
 * @param {Object} data - The 5-day / 3-hour forecast JSON response.
 */
function displayForecasts(data) {
    if (!hourlyForecastContainer) return;
    hourlyForecastContainer.innerHTML = ''; // Clear old hourly content

    // Ensure Daily Forecast Header exists
    if (dailyForecastContainer) {
        const header = dailyForecastContainer.querySelector('h3');
        if (!header) {
            const h = document.createElement('h3');
            h.textContent = '7-Day Forecast';
            dailyForecastContainer.insertBefore(h, dailyForecastContainer.firstChild);
        }
    }

    const hourlyList = data.list.slice(0, 8); // Take the next 8 intervals (24 hours)

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

    // --- Daily Forecast Logic (Fallback using 5-day/3hr data) ---
    const dayData = {}; // Object to store { "Mon": { hi: 0, lo: 999 } }
    
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toLocaleDateString('en-US', { weekday: 'short' });
        const tempMax = Math.round(item.main.temp_max); 
        const tempMin = Math.round(item.main.temp_min); 

        if (!dayData[dayKey]) {
            dayData[dayKey] = { hi: tempMax, lo: tempMin, iconSrc: getWeatherIcon(item.weather[0].main) };
        } else {
            dayData[dayKey].hi = Math.max(dayData[dayKey].hi, tempMax);
            dayData[dayKey].lo = Math.min(dayData[dayKey].lo, tempMin);
        }
    });

    // Insert 7 daily cards (today + next 6).
    const dailyScroll = document.querySelector('.daily-scroll-container');
    if (!dailyScroll) return;

    dailyScroll.innerHTML = ''; // Clear old daily content

    const today = new Date();
    // Generate the next 7 days' keys
    const next7 = Array.from({ length: 7 }, (_, i) => new Date(today.getTime() + i * 86400000))
        .map(d => d.toLocaleDateString('en-US', { weekday: 'short' }));

    next7.forEach(dayKey => {
        let day = dayData[dayKey] || { day: dayKey, hi: '--', lo: '--', iconSrc: 'images/clear.png' };

        const hiText = (typeof day.hi === 'number') ? `${day.hi}` : day.hi;
        const loText = (typeof day.lo === 'number') ? `${day.lo}` : day.lo;

        const dailyItemHTML = `
            <div class="daily-item">
                <p class="day">${dayKey}</p>
                <img src="${day.iconSrc}" alt="Weather icon">
                <p class="daily-temps">Hi ${hiText}&deg;<br>Lo ${loText}&deg;</p>
            </div>
        `;

        dailyScroll.innerHTML += dailyItemHTML;
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

    dailyScroll.innerHTML = ''; // clear previous (5-day fallback)

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
            // Reset apiKey to default baked-in value 
            apiKey = "fca1ee0d8fe311426b14aae80fdb3c2d"; 
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

/**
 * Main function to check and display weather data.
 * @param {string} input - City name or zip code for text search.
 * @param {number} lat - Latitude for coordinate search.
 * @param {number} lon - Longitude for coordinate search.
 */
async function checkWeather(input, lat = null, lon = null) {
    // Hide UI elements and show loading spinner
    document.querySelector(".weather").classList.remove("active");
    document.querySelector(".error").style.display = "none";
    if(loadingIndicator) loadingIndicator.style.display = "block";
    const oneCallToast = document.getElementById('onecall-toast');
    if (oneCallToast) oneCallToast.style.display = 'none';

    let locationName, stateName = null, countryCode;
    let locationData = null; 

    // Construct URLs inside the function to use the potentially overridden 'apiKey'
    const currentGeoApiUrl = `https://api.openweathermap.org/geo/1.0/direct?limit=1&appid=${apiKey}&q=`; 
    const currentWeatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?units=imperial&appid=${apiKey}&`;

    // --- PART 1: Determine Coordinates and Location Details (Geocoding / Reverse Geocoding) ---
    
    if (lat === null || lon === null) {
        // --- 1A: Standard Geocoding (City/Zip Input) ---
        const trimmedInput = input.trim();
        if (!trimmedInput) { 
            if(loadingIndicator) loadingIndicator.style.display = "none";
            return;
        }

        let geoResponse;
    
        // Check for Zip Code (5 digits)
        if (/^\d{5}$/.test(trimmedInput)) {
            // Use the Geocoding API's ZIP endpoint
            const zipGeoUrl = `https://api.openweathermap.org/geo/1.0/zip?zip=${trimmedInput},us&appid=${apiKey}`;
            geoResponse = await fetch(zipGeoUrl);
        } else {
            // Improve handling for inputs like "City, ST" (e.g., "Dallas, TX") by appending ',US'
            // when the second part looks like a 2-letter state code or common state name fragment.
            let locationString = trimmedInput;
            const parts = trimmedInput.split(',').map(p => p.trim());
            if (parts.length === 2) {
                const second = parts[1];
                // If second part is a 2-letter code or a state name, append ',US' if not present
                if (/^[A-Za-z]{2}$/.test(second) || second.length > 2) {
                    // If user included country already (e.g., 'NY, US'), don't double append
                    if (!/\bUS\b/i.test(parts.join(' '))) {
                        locationString = `${parts[0]}, ${parts[1]}, US`;
                    }
                }
            }

            // Use standard city name geocoding with the improved location string
            const encodedInput = encodeURIComponent(locationString);
            const cityGeoUrl = currentGeoApiUrl + encodedInput;
            geoResponse = await fetch(cityGeoUrl);
        }
    
        if (!geoResponse.ok) {
            // Log the raw status and body to help debug why geocoding failed (shows 401/403, etc.)
            const geoText = await geoResponse.text();
            console.error('Geocode failed:', geoResponse.status, geoText);
            document.querySelector(".error").innerHTML = "Location not found or API error. See console.";
            document.querySelector(".error").style.display = "block";
            if (loadingIndicator) loadingIndicator.style.display = "none";
            return;
        }

        let geoData = await geoResponse.json();

        if (Array.isArray(geoData) && geoData.length > 0) {
            locationData = geoData[0];
        } else if (geoData.lat && geoData.lon) { // Handle single object from ZIP API
            locationData = geoData;
        } else {
            document.querySelector(".error").innerHTML = "Location not found.";
            document.querySelector(".error").style.display = "block";
            if(loadingIndicator) loadingIndicator.style.display = "none";
            return;
        }
        
        lat = locationData.lat;
        lon = locationData.lon;

    } else {
        // --- 1B: Reverse Geocoding (Lat/Lon Input from Geolocation) ---
        const reverseGeoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
        const reverseResponse = await fetch(reverseGeoUrl);

        if (!reverseResponse.ok) {
            console.error("Reverse geocoding failed.");
        } else {
            const reverseData = await reverseResponse.json();
            if (reverseData.length > 0) {
                locationData = reverseData[0];
            }
        }
    }

    // Assign final location details
    if (locationData) {
        locationName = locationData.name || "Unknown Location";
        stateName = locationData.state || null;
        countryCode = locationData.country;
    } else {
        locationName = "Current Location"; // Fallback for reverse geocoding failure
        countryCode = "";
    }

    // --- PART 2: Fetch Current Weather ---
    const weatherResponse = await fetch(`${currentWeatherApiUrl}lat=${lat}&lon=${lon}`);

    if (!weatherResponse.ok) {
        document.querySelector(".error").innerHTML = "Failed to fetch weather data.";
        document.querySelector(".error").style.display = "block";
        if(loadingIndicator) loadingIndicator.style.display = "none";
        return;
    }
    
    const data = await weatherResponse.json();

    // --- PART 3: Update UI for Current Weather ---
    // Build a user-friendly location string:
    // - US: "City, ST, United States" (use 2-letter state code when possible)
    // - Other: "City, Country Name"
    function getStateCode(state) {
        if (!state) return null;
        if (/^[A-Za-z]{2}$/.test(state)) return state.toUpperCase();
        // Try mapping full state name to code
        return US_STATE_CODES[state] || null;
    }

    // Resolve a human-friendly country name. Prefer the hardcoded COUNTRY_NAMES mapping,
    // then fall back to Intl.DisplayNames if available. If neither is available, keep the
    // ISO country code as a last resort.
    let countryFull = null;
    if (countryCode) {
        countryFull = COUNTRY_NAMES[countryCode] || null;
        if (!countryFull) {
            try {
                if (typeof Intl !== 'undefined' && Intl.DisplayNames) {
                    const dn = new Intl.DisplayNames(['en'], { type: 'region' });
                    const resolved = dn.of(countryCode);
                    if (resolved && resolved !== countryCode) {
                        countryFull = resolved;
                    }
                }
            } catch (e) {
                // Ignore and allow countryFull to remain null
            }
        }
    }
    let cityDisplay = locationName;

    if (countryCode === 'US') {
        const sCode = getStateCode(stateName);
        if (sCode) {
            cityDisplay = `${locationName}, ${sCode}, ${countryFull || 'United States'}`;
        } else if (stateName) {
            cityDisplay = `${locationName}, ${stateName}, ${countryFull || 'United States'}`;
        } else {
            cityDisplay = `${locationName}, ${countryFull || 'United States'}`;
        }
    } else if (countryFull) {
        cityDisplay = `${locationName}, ${countryFull}`;
    } else if (countryCode) {
        cityDisplay = `${locationName}, ${countryCode}`;
    }

    document.querySelector(".city").innerHTML = cityDisplay;
    // Keep the details-location element minimal (optional)
    const detailsLocationEl = document.querySelector(".details-location");
    if (detailsLocationEl) detailsLocationEl.innerHTML = '';

    document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "&deg;F";
    document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
    // Wind is likely in the .details section, check if it exists
    const windEl = document.querySelector(".wind");
    if(windEl) windEl.innerHTML = Math.round(data.wind.speed) + " mph"; 
    
    // Assuming you have a .description element for weather description
    const descriptionEl = document.querySelector(".description");
    if(descriptionEl) descriptionEl.innerHTML = data.weather[0].description.replace(/\b\w/g, l => l.toUpperCase());
    
    weatherIcon.src = getWeatherIcon(data.weather[0].main);


    // --- PART 4: Fetch Detailed Forecasts (5-Day / Hourly) and Fallback ---
    
    // First, fetch the 5-day / 3-hour forecast for the hourly data and as a daily fallback
    const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?units=imperial&appid=${apiKey}&lat=${lat}&lon=${lon}`);
    const forecastData = await forecastResponse.json();

    if (forecastResponse.ok) {
        displayForecasts(forecastData); // Uses 5-day / 3hr data for both hourly and daily fallback
    }

    // --- PART 5: Fetch Alerts (NWS) ---
    // NWS is US-only, so only call it if we have a US location
    if(countryCode === 'US') {
        handleNwsAlerts(lat, lon); 
    } else {
        if (severeAlertBanner) {
            severeAlertBanner.innerHTML = '';
            severeAlertBanner.style.display = 'none';
        }
    }


    // --- PART 6: One Call API for Detailed 7-Day Data (Best Practice) ---
    const oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,current,alerts&units=imperial&appid=${apiKey}`;
    const oneCallResponse = await fetch(oneCallUrl);

    if (oneCallResponse.ok) {
        const oneCallData = await oneCallResponse.json();
        // Overwrite the daily forecast with the superior One Call data
        displayDailyOneCall(oneCallData); 
    } else {
        // Show a message/toast if One Call fails (e.g., if you haven't upgraded your OWM account)
        console.warn("One Call API access failed. Using 5-day forecast fallback.");
        const toast = document.getElementById('onecall-toast');
        if (toast) toast.style.display = 'flex';
        // The displayForecasts fallback function was already called in Part 4.
    }


    // --- PART 7: Final UI State ---
    if(input) saveCity(locationName); // Save only if search was text-based

    if (loadingIndicator) {
        loadingIndicator.style.display = "none";
    }

    // Show the weather display container
    document.querySelector(".card").classList.add("expanded");
    document.querySelector(".weather").classList.add("active");
    applyLayout(); // Re-apply layout preference after loading new data
}

// --- Event Listeners (Added to connect UI to logic) ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial load: Render saved cities and load layout preference
    renderSavedCities();
    applyLayout();

    // 2. Optional: Load weather for the first saved city on page load
    const cities = getSavedCities();
    if (cities.length > 0) {
        checkWeather(cities[0]);
    }
    
    // 3. Search button click
    if(searchBtn) {
        searchBtn.addEventListener('click', () => {
            checkWeather(searchBox.value);
        });
    }

    // 4. Search box 'Enter' key press
    if(searchBox) {
        searchBox.addEventListener("keyup", (event) => {
            if (event.key === "Enter") {
                checkWeather(searchBox.value);
            }
        });
    }

    // 5. Geolocation button click
    if(locationBtn) {
        locationBtn.addEventListener('click', getCurrentLocationWeather);
    }

    // 6. Saved Cities click listener
    if(savedCitiesContainer) {
        savedCitiesContainer.addEventListener('click', handleSavedCityClick);
    }
});

