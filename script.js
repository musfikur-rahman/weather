document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('city-input');
    const searchButton = document.getElementById('search-button');
    const cityName = document.getElementById('city-name');
    const temperature = document.getElementById('temperature');
    const feelsLike = document.getElementById('feels-like');
    const description = document.getElementById('description');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('wind-speed');
    const pressure = document.getElementById('pressure');
    const visibility = document.getElementById('visibility');
    const dewPoint = document.getElementById('dew-point');
    const uvIndex = document.getElementById('uv-index');

    const dailyForecastItemsContainer = document.querySelector('.daily-forecast-items');
    const hourlyForecastItemsContainer = document.querySelector('.hourly-forecast-items');

    const unitToggleBtn = document.getElementById('unit-toggle-btn');

    const API_KEY = '583509b0cebf81941e1eb2f736f65ac3'; 
    const CURRENT_WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
    const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
    const IP_API_URL = 'http://ip-api.com/json';

    let map; 
    let marker; 
    let currentUnit = 'metric'; // 'metric' for Celsius, 'imperial' for Fahrenheit
    let currentCity = ''; // Store the current city to re-fetch data

    // Initialize the map
    map = L.map('map').setView([0, 0], 18); 
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

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

        cityName.textContent = data.name;
        temperature.textContent = `${Math.round(data.main.temp)}${getUnitSymbol()}`;
        feelsLike.textContent = `${Math.round(data.main.feels_like)}${getUnitSymbol()}`;
        description.textContent = data.weather[0].description;
        humidity.textContent = `${data.main.humidity}%`;
        windSpeed.textContent = `${data.wind.speed} ${getWindSpeedUnit()}`;
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
            const temp = Math.round(item.main.temp);
            const desc = item.weather[0].description;

            const forecastItemDiv = document.createElement('div');
            forecastItemDiv.classList.add('daily-forecast-item'); 
            forecastItemDiv.innerHTML = `
                <h3>${dayName}</h3>
                <p>Temp: ${temp}${getUnitSymbol()}</p>
                <p>${desc}</p>
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

            const hourlyItemDiv = document.createElement('div');
            hourlyItemDiv.classList.add('hourly-forecast-item'); 
            hourlyItemDiv.innerHTML = `
                <h3>${time}</h3>
                <p>Temp: ${temp}${getUnitSymbol()}</p>
                <p>${desc}</p>
            `;
            hourlyForecastItemsContainer.appendChild(hourlyItemDiv);
        });
    }

    function clearWeatherData() {
        cityName.textContent = '';
        temperature.textContent = '';
        feelsLike.textContent = '';
        description.textContent = '';
        humidity.textContent = '';
        windSpeed.textContent = '';
        pressure.textContent = '';
        visibility.textContent = '';
        dewPoint.textContent = '';
        uvIndex.textContent = '';
        dailyForecastItemsContainer.innerHTML = '';
        hourlyForecastItemsContainer.innerHTML = '';
        if (marker) {
            map.removeLayer(marker);
            marker = null;
        }
    }

    function fetchLocationAndWeather() {
        fetch(IP_API_URL)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.status === 'success' && data.city) {
                    cityInput.value = data.city; 
                    currentCity = data.city; 
                    fetchWeatherData(currentCity, currentUnit);
                    fetchForecastData(currentCity, currentUnit);
                } else {
                    console.error('IP-API error:', data.message);
                    alert('Could not detect your location automatically. Please enter a city manually.');
                }
            })
            .catch(error => {
                console.error('Error fetching IP location:', error);
                alert('Could not detect your location automatically. Please enter a city manually.');
            });
    }

    // Call this function when the page loads
    fetchLocationAndWeather();
});