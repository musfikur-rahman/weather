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

    // API
    const API_KEY = '583509b0cebf81941e1eb2f736f65ac3';
    const CURRENT_WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
    const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
    const IP_GEOLOCATION_URL = 'https://ipinfo.io/json';

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
        const weatherPromise = fetchCurrentWeather(city);
        const forecastPromise = fetchForecast(city);
        await Promise.all([weatherPromise, forecastPromise]);
    };

    const fetchCurrentWeather = async (city) => {
        const url = `${CURRENT_WEATHER_URL}?q=${city}&appid=${API_KEY}&units=${currentUnit}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.cod === 200) {
                displayCurrentWeather(data);
            } else {
                alert('City not found! Please try again.');
                clearUI();
            }
        } catch (error) {
            console.error('Error fetching current weather:', error);
            clearUI("Failed to fetch weather data.");
        }
    };

    const fetchForecast = async (city) => {
        const url = `${FORECAST_URL}?q=${city}&appid=${API_KEY}&units=${currentUnit}`;
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

    const displayCurrentWeather = (data) => {
        cityName.textContent = data.name;
        date.textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
        temperature.textContent = `${Math.round(data.main.temp)}°`;
        feelsLike.textContent = `Feels like ${Math.round(data.main.feels_like)}°`;
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
            forecastItem.innerHTML = `
                <h3>${new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h3>
                <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].description}">
                <p class="temp">${Math.round(item.main.temp)}°</p>
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
            forecastItem.innerHTML = `
                <h3>${new Date(item.dt * 1000).toLocaleDateString([], { weekday: 'short' })}</h3>
                <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].description}">
                <p class="temp">${Math.round(item.main.temp_max)}° / ${Math.round(item.main.temp_min)}°</p>
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
