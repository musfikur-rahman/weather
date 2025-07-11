document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('city-input');
    const searchButton = document.getElementById('search-button');
    const cityName = document.getElementById('city-name');
    const temperature = document.getElementById('temperature');
    const feelsLike = document.getElementById('feels-like');
    const description = document.getElementById('description');
    const weatherIcon = document.getElementById('weather-icon');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('wind-speed');
    const windDirection = document.getElementById('wind-direction');
    const pressure = document.getElementById('pressure');
    const visibility = document.getElementById('visibility');
    const dewPoint = document.getElementById('dew-point');
    const uvIndex = document.getElementById('uv-index');
    const sunrise = document.getElementById('sunrise');
    const sunset = document.getElementById('sunset');
    const cloudiness = document.getElementById('cloudiness');

    const dailyForecastItemsContainer = document.querySelector('.daily-forecast-items');
    const hourlyForecastItemsContainer = document.querySelector('.hourly-forecast-items');

    const unitToggleBtn = document.getElementById('unit-toggle-btn');

    const API_KEY = '583509b0cebf81941e1eb2f736f65ac3'; 
    const CURRENT_WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
    const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
    
    let hourlyTempChart; // Declare chart variable globally

    let map; 
    let marker; 
    let currentUnit = 'metric'; // 'metric' for Celsius, 'imperial' for Fahrenheit
    let currentCity = 'London'; // Store the current city to re-fetch data

    // Define OpenWeatherMap tile layers
    const openWeatherMapBaseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Initialize the map
    map = L.map('map').setView([0, 0], 18); 
    openWeatherMapBaseLayer.addTo(map);

    // Initialize the hourly temperature chart
    const ctx = document.getElementById('hourlyTempChart').getContext('2d');
    hourlyTempChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Temperature',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: false
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
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Temperature'
                    }
                }
            }
        }
    });

    searchButton.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            currentCity = city;
            fetchWeatherData(currentCity, currentUnit);
            fetchForecastData(currentCity, currentUnit);
        }
    });

    cityInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            const city = cityInput.value.trim();
            if (city) {
                currentCity = city;
                fetchWeatherData(currentCity, currentUnit);
                fetchForecastData(currentCity, currentUnit);
            }
        }
    });

    unitToggleBtn.addEventListener('click', () => {
        if (currentUnit === 'metric') {
            currentUnit = 'imperial';
            unitToggleBtn.textContent = '°C'; // Button now shows option to switch to Celsius
        } else {
            currentUnit = 'metric';
            unitToggleBtn.textContent = '°F'; // Button now shows option to switch to Fahrenheit
        }
        if (currentCity) {
            fetchWeatherData(currentCity, currentUnit);
            fetchForecastData(currentCity, currentUnit);
        }
    });

    function getUnitSymbol() {
        return currentUnit === 'metric' ? '°C' : '°F';
    }

    function getWindSpeedUnit() {
        return currentUnit === 'metric' ? 'm/s' : 'mph';
    }

    function degToCardinal(deg) {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round((deg % 360) / 22.5);
        return directions[index % 16];
    }

    function fetchWeatherData(city, unit) {
        const url = `${CURRENT_WEATHER_URL}?q=${city}&appid=${API_KEY}&units=${unit}`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                displayWeatherData(data);
            })
            .catch(error => {
                console.error('Error fetching current weather data:', error);
                alert('Could not fetch current weather data. Please check the city name and your API key.');
                clearWeatherData();
            });
    }

    function displayWeatherData(data) {
        if (data.cod === '404') {
            alert('City not found. Please try again.');
            clearWeatherData();
            return;
        }

        const iconCode = data.weather[0].icon;
        weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
        weatherIcon.alt = data.weather[0].description;

        cityName.textContent = data.name;
        temperature.textContent = `${Math.round(data.main.temp)}${getUnitSymbol()}`;
        feelsLike.textContent = `Feels like: ${Math.round(data.main.feels_like)}${getUnitSymbol()}`;
        description.textContent = data.weather[0].description;
        humidity.textContent = `${data.main.humidity}%`;
        windSpeed.textContent = `${data.wind.speed} ${getWindSpeedUnit()}`;
        windDirection.textContent = degToCardinal(data.wind.deg);
        pressure.textContent = `${data.main.pressure} hPa`;
        visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`; 
        
        // Approximate Dew Point calculation (Magnus-Tetens formula approximation)
        // This calculation is for Celsius. If unit is Fahrenheit, convert temp to C, calculate, then convert back.
        let tempForDewPoint = data.main.temp;
        if (currentUnit === 'imperial') {
            tempForDewPoint = (data.main.temp - 32) * 5/9; // Convert F to C
        }
        const RH = data.main.humidity; 
        const a = 17.27;
        const b = 237.7;
        const alpha = ((a * tempForDewPoint) / (b + tempForDewPoint)) + Math.log(RH / 100);
        let calculatedDewPoint = (b * alpha) / (a - alpha);

        if (currentUnit === 'imperial') {
            calculatedDewPoint = (calculatedDewPoint * 9/5) + 32; // Convert C to F
        }
        dewPoint.textContent = `${Math.round(calculatedDewPoint)}${getUnitSymbol()}`;

        uvIndex.textContent = 'N/A'; 

        // Sunrise and Sunset
        const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        sunrise.textContent = sunriseTime;
        sunset.textContent = sunsetTime;

        // Cloudiness
        cloudiness.textContent = `${data.clouds.all}%`;

        // Update map location and marker
        // Update map location and marker
        const lat = data.coord.lat;
        const lon = data.coord.lon;
        map.setView([lat, lon], 18); // Increased zoom level to 12

        if (marker) {
            marker.setLatLng([lat, lon]);
        } else {
            marker = L.marker([lat, lon]).addTo(map);
        }
        marker.bindPopup(data.name).openPopup();
    }

    function fetchForecastData(city, unit) {
        const url = `${FORECAST_URL}?q=${city}&appid=${API_KEY}&units=${unit}`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                displayDailyForecastData(data);
                displayHourlyForecastData(data);
                updateHourlyTempChart(data);
            })
            .catch(error => {
                console.error('Error fetching forecast data:', error);
                dailyForecastItemsContainer.innerHTML = '<p>Could not load daily forecast.</p>';
                hourlyForecastItemsContainer.innerHTML = '<p>Could not load hourly forecast.</p>';
            });
    }

    function displayDailyForecastData(data) {
        dailyForecastItemsContainer.innerHTML = ''; 

        const dailyForecasts = {};

        data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const day = date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

            if (!dailyForecasts[day]) {
                dailyForecasts[day] = item; 
            }
        });

        Object.values(dailyForecasts).slice(0, 5).forEach(item => {
            const date = new Date(item.dt * 1000);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const fullDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const tempMin = Math.round(item.main.temp_min);
            const tempMax = Math.round(item.main.temp_max);
            const desc = item.weather[0].description;
            const iconCode = item.weather[0].icon;

            const forecastItemDiv = document.createElement('div');
            forecastItemDiv.classList.add('daily-forecast-item'); 
            forecastItemDiv.innerHTML = `
                <h3>${dayName}</h3>
                <p class="date">${fullDate}</p>
                <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="${desc}">
                <p class="temp">${tempMax}${getUnitSymbol()} / ${tempMin}${getUnitSymbol()}</p>
                <p class="description">${desc}</p>
            `;
            dailyForecastItemsContainer.appendChild(forecastItemDiv);
        });
    }

    function displayHourlyForecastData(data) {
        hourlyForecastItemsContainer.innerHTML = ''; 

        data.list.slice(0, 8).forEach(item => {
            const date = new Date(item.dt * 1000);
            const time = date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
            const temp = Math.round(item.main.temp);
            const desc = item.weather[0].description;
            const iconCode = item.weather[0].icon;

            const hourlyItemDiv = document.createElement('div');
            hourlyItemDiv.classList.add('hourly-forecast-item'); 
            hourlyItemDiv.innerHTML = `
                <h3>${time}</h3>
                <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="${desc}">
                <p class="temp">${temp}${getUnitSymbol()}</p>
                <p class="description">${desc}</p>
            `;
            hourlyForecastItemsContainer.appendChild(hourlyItemDiv);
        });
    }

    function updateHourlyTempChart(data) {
        const labels = [];
        const temperatures = [];

        data.list.slice(0, 8).forEach(item => { // Get data for the next 24 hours (8 * 3-hour intervals)
            const date = new Date(item.dt * 1000);
            labels.push(date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }));
            temperatures.push(Math.round(item.main.temp));
        });

        hourlyTempChart.data.labels = labels;
        hourlyTempChart.data.datasets[0].data = temperatures;
        hourlyTempChart.data.datasets[0].label = `Temperature (${getUnitSymbol()})`;
        hourlyTempChart.options.scales.y.title.text = `Temperature (${getUnitSymbol()})`;
        hourlyTempChart.update();
    }

    function clearWeatherData() {
        cityName.textContent = '';
        temperature.textContent = '';
        feelsLike.textContent = '';
        description.textContent = '';
        weatherIcon.src = '';
        weatherIcon.alt = '';
        humidity.textContent = '';
        windSpeed.textContent = '';
        windDirection.textContent = '';
        pressure.textContent = '';
        visibility.textContent = '';
        dewPoint.textContent = '';
        uvIndex.textContent = '';
        sunrise.textContent = '';
        sunset.textContent = '';
        cloudiness.textContent = '';
        dailyForecastItemsContainer.innerHTML = '';
        hourlyForecastItemsContainer.innerHTML = '';
        if (hourlyTempChart) {
            hourlyTempChart.destroy();
        }
        if (marker) {
            map.removeLayer(marker);
            marker = null;
        }
    }

    

    // Fetch weather for the default city on page load
    if (currentCity) {
        fetchWeatherData(currentCity, currentUnit);
        fetchForecastData(currentCity, currentUnit);
    }
});