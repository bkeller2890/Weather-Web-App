const apiKey = "fca1ee0d8fe311426b14aae80fdb3c2d";

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
    const cityTag = event.target.closest('.saved-city-tag');
    if (cityTag) {
        const cityName = cityTag.getAttribute('data-city-name');
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
    dailyForecastContainer.innerHTML = '<h3>7-Day Forecast</h3>'; // Clear old content, keep header

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

    // Insert the daily items into the container
    Object.keys(dayData).forEach(dayKey => {
        const day = dayData[dayKey];
        const dailyItemHTML = `
            <div class="daily-item">
                <p class="day">${dayKey}</p>
                <img src="${day.iconSrc}" alt="Weather icon">
                <p class="daily-temps">Hi ${day.hi}&deg; / Lo ${day.lo}&deg;</p>
            </div>
        `;
        dailyForecastContainer.innerHTML += dailyItemHTML;
    });
}

// Function signature: input is for text search, lat/lon for coordinate search
async function checkWeather(input, lat = null, lon = null) {
    document.querySelector(".weather").classList.remove("active");
    document.querySelector(".error").style.display = "none";

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
        // 🎯 FIX 2: When lat/lon are provided, perform reverse geocoding to get location names
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
    
    if (weatherResponse.status !== 200) {
        document.querySelector(".error").style.display = "block";
        document.querySelector(".city").innerHTML = "Weather Data Unavailable";
        return;
    }

    let weatherData = await weatherResponse.json();


    // --- PART 3: Display Data (Relies on initialized locationName, stateName, countryCode) ---
    
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