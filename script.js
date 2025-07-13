document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const cityInput = document.getElementById('city-input');
    const searchButton = document.getElementById('search-button');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const unitToggleBtn = document.getElementById('unit-toggle-btn');
    const loader = document.getElementById('loader');
    const cityName = document.getElementById('city-name');
    const date = document.getElementById('date');
    const temperature = document.getElementById('temperature');
    const feelsLike = document.getElementById('feels-like');
    const description = document.getElementById('description');
    const weatherIcon = document.getElementById('weather-icon');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('wind-speed');
    const windDirection = document.getElementById('wind-direction');
    const pressure = document.getElementById('pressure');
    const visibility = document.getElementById('visibility');
    const sunrise = document.getElementById('sunrise');
    const sunset = document.getElementById('sunset');
    const hourlyForecastContainer = document.getElementById('hourly-forecast');
    const dailyForecastContainer = document.getElementById('daily-forecast');
    const forecastTabs = document.querySelectorAll('.forecast-tab');
    const aqiElement = document.getElementById('aqi');
    const uvIndexElement = document.getElementById('uv-index');
    const alertsElement = document.getElementById('alerts');
    const allergyForecastElement = document.getElementById('allergy-forecast');

    // API
    const API_KEY = '583509b0cebf81941e1eb2f736f65ac3';
    const CURRENT_WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
    const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
    const AIR_POLLUTION_URL = 'https://api.openweathermap.org/data/2.5/air_pollution';
    const ONE_CALL_URL = 'https://api.openweathermap.org/data/2.5/onecall'; // For UV Index and Alerts
    const IP_GEOLOCATION_URL = 'https://ipinfo.io/json';

    // Country code to full name mapping
    const countryCodes = {
        "AF": "Afghanistan", "AL": "Albania", "DZ": "Algeria", "AS": "American Samoa", "AD": "Andorra",
        "AO": "Angola", "AI": "Anguilla", "AQ": "Antarctica", "AG": "Antigua and Barbuda", "AR": "Argentina",
        "AM": "Armenia", "AW": "Aruba", "AU": "Australia", "AT": "Austria", "AZ": "Azerbaijan",
        "BS": "Bahamas", "BH": "Bahrain", "BD": "Bangladesh", "BB": "Barbados", "BY": "Belarus",
        "BE": "Belgium", "BZ": "Belize", "BJ": "Benin", "BM": "Bermuda", "BT": "Bhutan",
        "BO": "Bolivia", "BA": "Bosnia and Herzegovina", "BW": "Botswana", "BV": "Bouvet Island", "BR": "Brazil",
        "IO": "British Indian Ocean Territory", "BN": "Brunei Darussalam", "BG": "Bulgaria", "BF": "Burkina Faso",
        "BI": "Burundi", "KH": "Cambodia", "CM": "Cameroon", "CA": "Canada", "CV": "Cape Verde",
        "KY": "Cayman Islands", "CF": "Central African Republic", "TD": "Chad", "CL": "Chile", "CN": "China",
        "CX": "Christmas Island", "CC": "Cocos (Keeling) Islands", "CO": "Colombia", "KM": "Comoros", "CG": "Congo",
        "CD": "Congo, Democratic Republic", "CK": "Cook Islands", "CR": "Costa Rica", "CI": "Cote D'Ivoire", "HR": "Croatia",
        "CU": "Cuba", "CY": "Cyprus", "CZ": "Czech Republic", "DK": "Denmark", "DJ": "Djibouti",
        "DM": "Dominica", "DO": "Dominican Republic", "EC": "Ecuador", "EG": "Egypt", "SV": "El Salvador",
        "GQ": "Equatorial Guinea", "ER": "Eritrea", "EE": "Estonia", "ET": "Ethiopia", "FK": "Falkland Islands",
        "FO": "Faroe Islands", "FJ": "Fiji", "FI": "Finland", "FR": "France", "GF": "French Guiana",
        "PF": "French Polynesia", "TF": "French Southern Territories", "GA": "Gabon", "GM": "Gambia", "GE": "Georgia",
        "DE": "Germany", "GH": "Ghana", "GI": "Gibraltar", "GR": "Greece", "GL": "Greenland",
        "GD": "Grenada", "GP": "Guadeloupe", "GU": "Guam", "GT": "Guatemala", "GN": "Guinea",
        "GW": "Guinea-Bissau", "GY": "Guyana", "HT": "Haiti", "HM": "Heard Island and McDonald Islands", "VA": "Holy See",
        "HN": "Honduras", "HK": "Hong Kong", "HU": "Hungary", "IS": "Iceland", "IN": "India",
        "ID": "Indonesia", "IR": "Iran", "IQ": "Iraq", "IE": "Ireland", "IL": "Israel",
        "IT": "Italy", "JM": "Jamaica", "JP": "Japan", "JO": "Jordan", "KZ": "Kazakhstan",
        "KE": "Kenya", "KI": "Kiribati", "KP": "Korea, Democratic People's Republic", "KR": "Korea, Republic of", "KW": "Kuwait",
        "KG": "Kyrgyzstan", "LA": "Lao People's Democratic Republic", "LV": "Latvia", "LB": "Lebanon", "LS": "Lesotho",
        "LR": "Liberia", "LY": "Libyan Arab Jamahiriya", "LI": "Liechtenstein", "LT": "Lithuania", "LU": "Luxembourg",
        "MO": "Macao", "MK": "Macedonia", "MG": "Madagascar", "MW": "Malawi", "MY": "Malaysia",
        "MV": "Maldives", "ML": "Mali", "MT": "Malta", "MH": "Marshall Islands", "MQ": "Martinique",
        "MR": "Mauritania", "MU": "Mauritius", "YT": "Mayotte", "MX": "Mexico", "FM": "Micronesia",
        "MD": "Moldova", "MC": "Monaco", "MN": "Mongolia", "MS": "Montserrat", "MA": "Morocco",
        "MZ": "Mozambique", "MM": "Myanmar", "NA": "Namibia", "NR": "Nauru", "NP": "Nepal",
        "NL": "Netherlands", "AN": "Netherlands Antilles", "NC": "New Caledonia", "NZ": "New Zealand", "NI": "Nicaragua",
        "NE": "Niger", "NG": "Nigeria", "NU": "Niue", "NF": "Norfolk Island", "MP": "Northern Mariana Islands",
        "NO": "Norway", "OM": "Oman", "PK": "Pakistan", "PW": "Palau", "PS": "Palestinian Territory",
        "PA": "Panama", "PG": "Papua New Guinea", "PY": "Paraguay", "PE": "Peru", "PH": "Philippines",
        "PN": "Pitcairn", "PL": "Poland", "PT": "Portugal", "PR": "Puerto Rico", "QA": "Qatar",
        "RE": "Reunion", "RO": "Romania", "RU": "Russian Federation", "RW": "Rwanda", "SH": "Saint Helena",
        "KN": "Saint Kitts and Nevis", "LC": "Saint Lucia", "PM": "Saint Pierre and Miquelon", "VC": "Saint Vincent and the Grenadines", "WS": "Samoa",
        "SM": "San Marino", "ST": "Sao Tome and Principe", "SA": "Saudi Arabia", "SN": "Senegal", "CS": "Serbia and Montenegro",
        "SC": "Seychelles", "SL": "Sierra Leone", "SG": "Singapore", "SK": "Slovakia", "SI": "Slovenia",
        "SB": "Solomon Islands", "SO": "Somalia", "ZA": "South Africa", "GS": "South Georgia and the South Sandwich Islands", "ES": "Spain",
        "LK": "Sri Lanka", "SD": "Sudan", "SR": "Suriname", "SJ": "Svalbard and Jan Mayen", "SZ": "Swaziland",
        "SE": "Sweden", "CH": "Switzerland", "SY": "Syrian Arab Republic", "TW": "Taiwan", "TJ": "Tajikistan",
        "TZ": "Tanzania", "TH": "Thailand", "TL": "Timor-Leste", "TG": "Togo", "TK": "Tokelau",
        "TO": "Tonga", "TT": "Trinidad and Tobago", "TN": "Tunisia", "TR": "Turkey", "TM": "Turkmenistan",
        "TC": "Turks and Caicos Islands", "TV": "Tuvalu", "UG": "Uganda", "UA": "Ukraine", "AE": "United Arab Emirates",
        "GB": "United Kingdom", "US": "United States", "UM": "United States Minor Outlying Islands", "UY": "Uruguay", "UZ": "Uzbekistan",
        "VU": "Vanuatu", "VE": "Venezuela", "VN": "Viet Nam", "VG": "Virgin Islands, British", "VI": "Virgin Islands, U.S.",
        "WF": "Wallis and Futuna", "EH": "Western Sahara", "YE": "Yemen", "ZM": "Zambia", "ZW": "Zimbabwe"
    };

    // State
    let currentUnit = 'metric';
    let currentCity;
    let map;
    let marker;
    let hourlyChart;

    // Initial setup
    const init = async () => {
        showLoader();
        initChart();
        addEventListeners();
        const city = await fetchUserLocation();
        if (city) {
            currentCity = city;
            await fetchData(currentCity);
        } else {
            clearUI("Could not determine your location. Please search for a city.");
        }
        hideLoader();
    };

    const showLoader = () => {
        loader.style.display = 'flex';
    };

    const hideLoader = () => {
        loader.style.display = 'none';
    };

    const fetchUserLocation = async () => {
        try {
            const response = await fetch(IP_GEOLOCATION_URL);
            if (!response.ok) {
                console.error("IP Geolocation API response not OK:", response.status);
                return null;
            }
            const data = await response.json();
            return data.city || null;
        } catch (error) {
            console.error('Error fetching user location from IP:', error);
            return null;
        }
    };

    const clearUI = (message = 'Please search for a city') => {
        cityName.textContent = message;
        date.textContent = 'Weather information will appear here';
        temperature.textContent = '-°';
        feelsLike.textContent = '';
        description.textContent = '';
        weatherIcon.src = '';
        humidity.textContent = '-';
        windSpeed.textContent = '-';
        windDirection.textContent = '-';
        pressure.textContent = '-';
        visibility.textContent = '-';
        sunrise.textContent = '-';
        sunset.textContent = '-';
        aqiElement.textContent = '-';
        uvIndexElement.textContent = '-';
        alertsElement.textContent = 'No alerts';
        allergyForecastElement.textContent = 'N/A';
        hourlyForecastContainer.innerHTML = '<p>No data to display.</p>';
        dailyForecastContainer.innerHTML = '<p>No data to display.</p>';
        if (map) {
            map.remove();
            map = null;
        }
        if (hourlyChart) {
            hourlyChart.data.labels = [];
            hourlyChart.data.datasets[0].data = [];
            hourlyChart.update();
        }
    };

    const initMap = (lat, lon) => {
        if (!map) {
            map = L.map('map');
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
        }
        updateMap(lat, lon, currentCity);
    };

    const initChart = () => {
        const ctx = document.getElementById('hourly-chart').getContext('2d');
        hourlyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Temperature',
                    data: [],
                    borderColor: '#5e72e4',
                    backgroundColor: 'rgba(94, 114, 228, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Temperature (°C)'
                        },
                        grid: {
                            color: '#e9ecef'
                        }
                    }
                }
            }
        });
    };

    const addEventListeners = () => {
        searchButton.addEventListener('click', handleSearch);
        cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
        themeToggleBtn.addEventListener('click', toggleTheme);
        unitToggleBtn.addEventListener('click', toggleUnits);
        forecastTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                forecastTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                document.querySelectorAll('.forecast-content').forEach(c => c.classList.remove('active'));
                document.getElementById(tab.dataset.target).classList.add('active');
            });
        });
    };

    const handleSearch = async () => {
        const city = cityInput.value.trim();
        if (city) {
            showLoader();
            currentCity = city;
            await fetchData(currentCity);
            hideLoader();
        } else {
            alert('Please enter a city name.');
        }
    };

    const toggleTheme = () => {
        document.body.classList.toggle('dark-mode');
        const icon = themeToggleBtn.querySelector('i');
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
        updateChartAppearance();
    };

    const toggleUnits = async () => {
        if (!currentCity) {
            alert('Please search for a city first.');
            return;
        }
        if (currentUnit === 'metric') {
            currentUnit = 'imperial';
            unitToggleBtn.textContent = '°C';
        } else {
            currentUnit = 'metric';
            unitToggleBtn.textContent = '°F';
        }
        showLoader();
        await fetchData(currentCity);
        hideLoader();
    };

    const fetchData = async (city) => {
        const weatherData = await fetchCurrentWeather(city);

        if (weatherData && weatherData.coord) {
            const { lat, lon } = weatherData.coord;
            await Promise.all([
                fetchForecast(lat, lon),
                fetchAirPollution(lat, lon),
                fetchOneCallData(lat, lon)
            ]);
        }
    };

    const fetchCurrentWeather = async (city) => {
        const url = `${CURRENT_WEATHER_URL}?q=${city}&appid=${API_KEY}&units=${currentUnit}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.cod === 200) {
                displayCurrentWeather(data);
                return data; // Return data for coordinates
            } else {
                alert('City not found! Please try again.');
                const userLocationCity = await fetchUserLocation();
                if (userLocationCity) {
                    currentCity = userLocationCity;
                    await fetchData(currentCity);
                } else {
                    clearUI("Could not determine your location. Please search for a city.");
                }
                return null;
            }
        } catch (error) {
            console.error('Error fetching current weather:', error);
            clearUI("Failed to fetch weather data.");
            return null;
        }
    };

    const fetchForecast = async (lat, lon) => {
        const url = `${FORECAST_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentUnit}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.cod === "200") {
                displayHourlyForecast(data.list);
                displayDailyForecast(data.list);
                updateHourlyChart(data.list);
            }
        } catch (error) {
            console.error('Error fetching forecast:', error);
        }
    };

    const fetchAirPollution = async (lat, lon) => {
        const url = `${AIR_POLLUTION_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.cod !== "400") { // API returns 400 for no data
                displayAirQuality(data);
            } else {
                aqiElement.textContent = 'N/A';
            }
        } catch (error) {
            console.error('Error fetching air pollution data:', error);
            aqiElement.textContent = 'N/A';
        }
    };

    const fetchOneCallData = async (lat, lon) => {
        // Exclude minutely, hourly, daily, and current to only get alerts and UV (if available in current)
        const url = `${ONE_CALL_URL}?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,current&appid=${API_KEY}&units=${currentUnit}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data) {
                displayUvIndex(data.current); // UV index is in current object
                displayAlerts(data.alerts);
            }
        } catch (error) {
            console.error('Error fetching one call data:', error);
            uvIndexElement.textContent = 'N/A';
            alertsElement.textContent = 'No alerts';
        }
    };

    const displayAirQuality = (data) => {
        if (data.list && data.list.length > 0) {
            const aqi = data.list[0].main.aqi;
            let aqiText = '';
            switch (aqi) {
                case 1: aqiText = 'Good'; break;
                case 2: aqiText = 'Fair'; break;
                case 3: aqiText = 'Moderate'; break;
                case 4: aqiText = 'Poor'; break;
                case 5: aqiText = 'Very Poor'; break;
                default: aqiText = 'N/A';
            }
            aqiElement.textContent = `${aqi} (${aqiText})`;
        } else {
            aqiElement.textContent = 'N/A';
        }
    };

    const displayUvIndex = (currentData) => {
        if (currentData && currentData.uvi !== undefined) {
            uvIndexElement.textContent = currentData.uvi;
        } else {
            uvIndexElement.textContent = 'N/A';
        }
    };

    const displayAlerts = (alertsData) => {
        if (alertsData && alertsData.length > 0) {
            const alertMessages = alertsData.map(alert => alert.event).join(', ');
            alertsElement.textContent = alertMessages;
            alertsElement.style.color = 'red'; // Highlight alerts
        } else {
            alertsElement.textContent = 'No alerts';
            alertsElement.style.color = 'var(--text-color)'; // Reset color
        }
    };

    const displayCurrentWeather = (data) => {
        cityName.textContent = `${data.name}, ${countryCodes[data.sys.country] || data.sys.country}`;
        date.textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
        const unitSymbol = currentUnit === 'metric' ? 'C' : 'F';
        temperature.textContent = `${Math.round(data.main.temp)}°${unitSymbol}`;
        feelsLike.textContent = `Feels like ${Math.round(data.main.feels_like)}°${unitSymbol}`;
        description.textContent = data.weather[0].description;
        weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
        humidity.textContent = `${data.main.humidity}%`;
        windSpeed.textContent = `${data.wind.speed.toFixed(1)} ${currentUnit === 'metric' ? 'm/s' : 'mph'}`;
        windDirection.textContent = degToCardinal(data.wind.deg);
        pressure.textContent = `${data.main.pressure} hPa`;
        visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
        sunrise.textContent = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        sunset.textContent = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (!map) {
            initMap(data.coord.lat, data.coord.lon);
        } else {
            updateMap(data.coord.lat, data.coord.lon, data.name);
        }
    };

    const displayHourlyForecast = (forecast) => {
        hourlyForecastContainer.innerHTML = '';
        forecast.slice(0, 8).forEach(item => {
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            const unitSymbol = currentUnit === 'metric' ? 'C' : 'F';
            forecastItem.innerHTML = `
                <h3>${new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}<br>${new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h3>
                <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].description}">
                <p class="temp">${Math.round(item.main.temp)}°${unitSymbol}</p>
            `;
            hourlyForecastContainer.appendChild(forecastItem);
        });
    };

    const displayDailyForecast = (forecast) => {
        dailyForecastContainer.innerHTML = '';
        const dailyData = {};
        forecast.forEach(item => {
            const day = new Date(item.dt * 1000).toLocaleDateString([], { weekday: 'short' });
            if (!dailyData[day]) {
                dailyData[day] = item;
            }
        });

        Object.values(dailyData).slice(0, 5).forEach(item => {
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            const unitSymbol = currentUnit === 'metric' ? 'C' : 'F';
            forecastItem.innerHTML = `
                <h3>${new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</h3>
                <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].description}">
                <p class="temp">${Math.round(item.main.temp_max)}°${unitSymbol} / ${Math.round(item.main.temp_min)}°${unitSymbol}</p>
            `;
            dailyForecastContainer.appendChild(forecastItem);
        });
    };

    const updateMap = (lat, lon, name) => {
        setTimeout(() => {
            if (map) {
                map.invalidateSize();
                map.setView([lat, lon], 13);
                if (marker) {
                    marker.setLatLng([lat, lon]);
                } else {
                    marker = L.marker([lat, lon]).addTo(map);
                }
                marker.bindPopup(name).openPopup();
            }
        }, 100);
    };

    const updateHourlyChart = (forecast) => {
        const labels = forecast.slice(0, 8).map(item => new Date(item.dt * 1000).toLocaleTimeString([], { hour: 'numeric' }));
        const data = forecast.slice(0, 8).map(item => item.main.temp);
        hourlyChart.data.labels = labels;
        hourlyChart.data.datasets[0].data = data;
        
        const unitSymbol = currentUnit === 'metric' ? 'C' : 'F';
        hourlyChart.options.scales.y.title.text = `Temperature (°${unitSymbol})`;

        updateChartAppearance();
    };

    const updateChartAppearance = () => {
        const isDarkMode = document.body.classList.contains('dark-mode');
        const gridColor = isDarkMode ? '#2c4a7e' : '#e9ecef';
        const textColor = isDarkMode ? '#e9ecef' : '#32325d';

        if (hourlyChart) {
            hourlyChart.options.scales.y.grid.color = gridColor;
            hourlyChart.options.scales.x.grid.display = false;
            hourlyChart.options.scales.x.ticks.color = textColor;
            hourlyChart.options.scales.y.ticks.color = textColor;
            hourlyChart.options.scales.y.title.color = textColor;
            hourlyChart.update();
        }
    };

    const degToCardinal = (deg) => {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        return directions[Math.round(deg / 22.5) % 16];
    };

    init();
});
