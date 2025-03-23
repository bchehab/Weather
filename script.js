// API configuration
// Note: You'll need to sign up for an OpenWeatherMap API key at https://openweathermap.org/api
const API_KEY = '09dbc71145bf529c693dd3b6ebe11b42'; // Replace with your actual OpenWeatherMap API key
const CURRENT_WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_API_URL = 'https://api.openweathermap.org/data/2.5/forecast';

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const locationElement = document.getElementById('location');
const dateTimeElement = document.getElementById('date-time');
const temperatureElement = document.getElementById('temperature');
const feelsLikeElement = document.getElementById('feels-like');
const weatherDescriptionElement = document.getElementById('weather-description');
const weatherIconElement = document.getElementById('weather-icon');
const windElement = document.getElementById('wind');
const humidityElement = document.getElementById('humidity');
const pressureElement = document.getElementById('pressure');
const uvIndexElement = document.getElementById('uv-index');
const forecastContainer = document.getElementById('forecast-container');
const appContainer = document.querySelector('.app-container') || document.body;

// Weather condition mapping to icons
const weatherImages = {
  clear: 'https://openweathermap.org/img/wn/01d@2x.png',
  clouds: 'https://openweathermap.org/img/wn/03d@2x.png',
  partlyCloudy: 'https://openweathermap.org/img/wn/02d@2x.png',
  rain: 'https://openweathermap.org/img/wn/10d@2x.png',
  thunderstorm: 'https://openweathermap.org/img/wn/11d@2x.png',
  snow: 'https://openweathermap.org/img/wn/13d@2x.png',
  drizzle: 'https://openweathermap.org/img/wn/09d@2x.png',
  mist: 'https://openweathermap.org/img/wn/50d@2x.png',
  fog: 'https://openweathermap.org/img/wn/50d@2x.png'
};

// Default coordinates (New York)
let latitude = 40.7128;
let longitude = -74.0060;

// Add Sa3do's personal branding to the page
function addPersonalBranding() {
  // Create the header element
  const header = document.createElement('header');
  header.className = 'sa3do-header';

  // Create the title with a fun weather-related tagline
  const title = document.createElement('h1');
  title.innerHTML = "Sa3do's Weather Wonderland";

  // Create a fun tagline
  const tagline = document.createElement('p');
  tagline.className = 'tagline';
  tagline.textContent = "Weather Forecasts as Amazing as Sa3do!";

  // Add elements to the header
  header.appendChild(title);
  header.appendChild(tagline);

  // Add the header to the top of the page
  const firstChild = appContainer.firstChild;
  appContainer.insertBefore(header, firstChild);

  // Add a footer with "created by" info and API attribution combined
  const footer = document.createElement('footer');
  footer.className = 'sa3do-footer';
  footer.innerHTML = `
    <p>Powered by OpenWeatherMap API | Proudly created by Sa3do - Future Weather Scientist 🌤️</p>
    <div class="emoji-decoration">🌈 ☀️ 🌧️ ❄️ 🌪️</div>
  `;

  // Add the footer to the end of the page
  appContainer.appendChild(footer);

  // Add custom styling
  addCustomStyling();
}

// Add custom styling for Sa3do's branding
function addCustomStyling() {
  const style = document.createElement('style');
  style.textContent = `
    .sa3do-header {
      background: linear-gradient(135deg, #42e695 0%, #3bb2b8 100%);
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 10px;
      margin-bottom: 20px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      animation: fadeIn 1s ease-in-out;
    }
    
    .sa3do-header h1 {
      margin: 0;
      font-size: 2.2em;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    
    .tagline {
      font-style: italic;
      margin: 10px 0 0;
      font-size: 1.2em;
      opacity: 0.9;
    }
    
    .sa3do-footer {
      text-align: center;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 10px;
      font-size: 0.9em;
      color: #555;
      box-shadow: 0 -2px 5px rgba(0,0,0,0.05);
    }
    
    .emoji-decoration {
      font-size: 1.5em;
      margin-top: 10px;
      letter-spacing: 10px;
    }
    
    /* Add a fun hover effect on the forecast items for interactivity */
    .forecast-item {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .forecast-item:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 15px rgba(0,0,0,0.1);
    }
    
    /* Animation for header */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    /* Make the current weather display more exciting */
    #weather-icon {
      transition: transform 0.5s ease;
    }
    
    #weather-icon:hover {
      transform: scale(1.1) rotate(5deg);
    }
    
    /* Sa3do's signature color for temperature */
    #temperature {
      color: #3bb2b8;
      font-weight: bold;
    }
  `;

  document.head.appendChild(style);
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  // Add Sa3do's personal branding
  addPersonalBranding();

  // Get user's location if permission granted
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        getWeatherData();
      },
      (error) => {
        console.error('Error getting location:', error);
        getWeatherData(); // Use default coordinates
      }
    );
  } else {
    getWeatherData(); // Use default coordinates
  }

  // Event listeners
  searchButton.addEventListener('click', handleSearch);
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });
});

// Search for location
async function handleSearch() {
  const query = searchInput.value.trim();
  if (!query) return;

  try {
    // We'll use a geocoding service to convert location name to coordinates
    const geocodeURL = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
    const response = await fetch(geocodeURL);
    const data = await response.json();

    if (data && data.length > 0) {
      latitude = parseFloat(data[0].lat);
      longitude = parseFloat(data[0].lon);
      getWeatherData();
    } else {
      alert('Location not found. Please try again.');
    }
  } catch (error) {
    console.error('Error searching for location:', error);
    alert('Failed to search for location. Please try again.');
  }
}

// Get weather data from OpenWeatherMap API
async function getWeatherData() {
  try {
    // Get current weather data
    const currentWeatherResponse = await fetch(
      `${CURRENT_WEATHER_API_URL}?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
    );

    // Get 5-day forecast data
    const forecastResponse = await fetch(
      `${FORECAST_API_URL}?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
    );

    if (!currentWeatherResponse.ok || !forecastResponse.ok) {
      throw new Error(`API request failed with status ${currentWeatherResponse.status} or ${forecastResponse.status}`);
    }

    const currentWeatherData = await currentWeatherResponse.json();
    const forecastData = await forecastResponse.json();

    // Process the OpenWeatherMap data into our format
    const processedData = processOpenWeatherMapData(currentWeatherData, forecastData);
    updateUI(processedData);

    // Set location name from the API response
    locationElement.textContent = currentWeatherData.name + ', ' + currentWeatherData.sys.country;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    locationElement.textContent = 'Failed to load weather data';

    // If API call fails, fall back to simulation for demo purposes
    if (confirm('Failed to fetch actual weather data. Would you like to see simulated data instead?')) {
      const simulatedData = simulateWeatherAPIResponse(latitude, longitude);
      updateUI(simulatedData);
    }
  }
}

// Process OpenWeatherMap API data
function processOpenWeatherMapData(currentData, forecastData) {
  // Process current weather data
  const current = {
    temp: currentData.main.temp,
    feels_like: currentData.main.feels_like,
    condition: mapWeatherCondition(currentData.weather[0].id),
    description: currentData.weather[0].description,
    icon: `https://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png`,
    wind_speed: Math.round(currentData.wind.speed * 3.6), // Convert from m/s to km/h
    humidity: currentData.main.humidity,
    pressure: currentData.main.pressure,
    uv_index: estimateUVIndex(currentData.clouds.all) // Estimate UV based on cloud cover
  };

  // Process forecast data (next 5 days)
  const forecast = [];
  const dailyForecasts = extractDailyForecastData(forecastData);

  // Add forecasts for the next 5 days
  for (let i = 0; i < 5 && i < dailyForecasts.length; i++) {
    const day = dailyForecasts[i];
    forecast.push({
      date: day.date,
      temp_max: day.maxTemp,
      temp_min: day.minTemp,
      condition: mapWeatherCondition(day.weatherId),
      description: day.description,
      icon: `https://openweathermap.org/img/wn/${day.icon}@2x.png`
    });
  }

  return {
    current,
    forecast
  };
}

// Extract daily data from OpenWeatherMap 3-hour forecast data
function extractDailyForecastData(forecastData) {
  const dailyData = [];
  const dailyMap = new Map();

  // Group forecast by day
  forecastData.list.forEach(item => {
    const date = item.dt_txt.split(' ')[0];

    if (!dailyMap.has(date)) {
      dailyMap.set(date, {
        date: date,
        minTemp: Infinity,
        maxTemp: -Infinity,
        weatherId: 0,
        description: '',
        icon: '01d',
        weatherCounts: {}
      });
    }

    const dayData = dailyMap.get(date);

    // Update min/max temperature
    dayData.minTemp = Math.min(dayData.minTemp, item.main.temp);
    dayData.maxTemp = Math.max(dayData.maxTemp, item.main.temp);

    // Count weather conditions to find the most common one for the day
    const weatherId = item.weather[0].id;
    dayData.weatherCounts[weatherId] = (dayData.weatherCounts[weatherId] || 0) + 1;
  });

  // Find the most common weather condition for each day
  dailyMap.forEach(dayData => {
    let maxCount = 0;
    let mostCommonWeatherId = 0;

    Object.entries(dayData.weatherCounts).forEach(([weatherId, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonWeatherId = parseInt(weatherId);

        // Find matching description and icon for this weather ID
        forecastData.list.some(item => {
          if (item.weather[0].id === mostCommonWeatherId) {
            dayData.description = item.weather[0].description;
            dayData.icon = item.weather[0].icon;
            return true;
          }
          return false;
        });
      }
    });

    dayData.weatherId = mostCommonWeatherId;
    dailyData.push(dayData);
  });

  // Get only future days (skip today if it's in the list)
  const today = new Date().toISOString().split('T')[0];
  return dailyData.filter(day => day.date > today);
}

// Map OpenWeatherMap condition codes to our application's condition names
function mapWeatherCondition(weatherId) {
  // Weather condition codes: https://openweathermap.org/weather-conditions
  if (weatherId >= 200 && weatherId < 300) {
    return 'thunderstorm';
  } else if (weatherId >= 300 && weatherId < 400) {
    return 'drizzle';
  } else if (weatherId >= 500 && weatherId < 600) {
    return 'rain';
  } else if (weatherId >= 600 && weatherId < 700) {
    return 'snow';
  } else if (weatherId >= 700 && weatherId < 800) {
    if (weatherId === 741) return 'fog';
    return 'mist';
  } else if (weatherId === 800) {
    return 'clear';
  } else if (weatherId === 801) {
    return 'partly cloudy';
  } else if (weatherId >= 802 && weatherId < 900) {
    return 'clouds';
  } else {
    return 'clear'; // Default
  }
}

// Estimate UV index based on cloud cover (simplified)
function estimateUVIndex(cloudCover) {
  // Cloud cover from 0-100%
  // UV index from 0-11
  const maxUV = 11;
  return Math.round(maxUV * (1 - (cloudCover / 100)));
}

// Update UI with weather data
function updateUI(data) {
  // Current weather
  const currentTemp = Math.round(data.current.temp);
  const feelsLikeTemp = Math.round(data.current.feels_like);
  temperatureElement.textContent = `${currentTemp}°C`;
  feelsLikeElement.textContent = `Feels like: ${feelsLikeTemp}°C`;
  weatherDescriptionElement.textContent = data.current.description;

  // Weather icon - use the API-provided icon directly if available
  weatherIconElement.src = data.current.icon || getWeatherIcon(data.current.condition);

  // Date and time
  const now = new Date();
  dateTimeElement.textContent = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Weather details
  windElement.textContent = `${data.current.wind_speed} km/h`;
  humidityElement.textContent = `${data.current.humidity}%`;
  pressureElement.textContent = `${data.current.pressure} hPa`;
  uvIndexElement.textContent = data.current.uv_index;

  // Forecast
  forecastContainer.innerHTML = '';
  data.forecast.forEach(day => {
    const forecastItem = document.createElement('div');
    forecastItem.className = 'forecast-item';

    const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });

    forecastItem.innerHTML = `
            <div class="day">${dayName}</div>
            <img src="${day.icon || getWeatherIcon(day.condition)}" alt="${day.description}">
            <div class="temp">
                <span class="max">${Math.round(day.temp_max)}°</span>
                <span class="min">${Math.round(day.temp_min)}°</span>
            </div>
            <div class="description">${day.description}</div>
        `;

    forecastContainer.appendChild(forecastItem);
  });

  // Add Sa3do's favorite weather fact - changes randomly each time
  const weatherFacts = [
    "Did you know? Lightning is 5 times hotter than the sun's surface!",
    "Cool fact: Rain drops are actually shaped like tiny hamburgers, not tear drops!",
    "Sa3do's weather tip: If you see cows lying down, it might rain soon!",
    "Weather magic: No two snowflakes are exactly alike!",
    "Sa3do's science: Hurricanes need warm water to form!",
    "Amazing! The fastest recorded wind speed was 407 km/h during a tornado in Oklahoma!"
  ];

  const randomFact = weatherFacts[Math.floor(Math.random() * weatherFacts.length)];

  // Add or update the weather fact element
  let factElement = document.getElementById('sa3do-weather-fact');
  if (!factElement) {
    factElement = document.createElement('div');
    factElement.id = 'sa3do-weather-fact';
    factElement.style.margin = '20px 0';
    factElement.style.padding = '10px';
    factElement.style.backgroundColor = '#f0f8ff';
    factElement.style.borderRadius = '8px';
    factElement.style.borderLeft = '4px solid #3bb2b8';
    factElement.style.fontSize = '0.9em';

    // Insert after the current weather details
    const currentWeatherContainer = document.querySelector('.current-weather') || temperatureElement.parentNode;
    currentWeatherContainer.parentNode.insertBefore(factElement, currentWeatherContainer.nextSibling);
  }

  factElement.textContent = `🔍 Sa3do's Weather Fact: ${randomFact}`;
}

// Get appropriate weather icon based on condition
function getWeatherIcon(condition) {
  const defaultIcon = 'https://openweathermap.org/img/wn/01d@2x.png';
  return weatherImages[condition.toLowerCase()] || defaultIcon;
}

// Simulate OpenWeatherMap API response for demo purposes
function simulateWeatherAPIResponse(lat, lon) {
  // Current date
  const now = new Date();

  // Weather conditions to randomly select from
  const conditions = ['clear', 'clouds', 'partly cloudy', 'rain', 'thunderstorm', 'snow', 'drizzle', 'mist', 'fog'];
  const descriptions = {
    'clear': 'Clear sky',
    'clouds': 'Overcast clouds',
    'partly cloudy': 'Few clouds',
    'rain': 'Moderate rain',
    'thunderstorm': 'Thunderstorm',
    'snow': 'Snow',
    'drizzle': 'Light drizzle',
    'mist': 'Mist',
    'fog': 'Fog'
  };

  // Generate random current weather
  const currentCondition = conditions[Math.floor(Math.random() * conditions.length)];
  const current = {
    temp: Math.floor(Math.random() * 30) + 5, // 5 to 35 degrees
    feels_like: Math.floor(Math.random() * 30) + 5,
    condition: currentCondition,
    description: descriptions[currentCondition],
    icon: `https://openweathermap.org/img/wn/${getRandomIcon(currentCondition)}@2x.png`,
    wind_speed: Math.floor(Math.random() * 30) + 5, // 5 to 35 km/h
    humidity: Math.floor(Math.random() * 50) + 30, // 30 to 80%
    pressure: Math.floor(Math.random() * 30) + 1000, // 1000 to 1030 hPa
    uv_index: Math.floor(Math.random() * 10) + 1 // 1 to 11
  };

  // Generate 5-day forecast
  const forecast = [];
  for (let i = 1; i <= 5; i++) {
    const forecastDate = new Date();
    forecastDate.setDate(now.getDate() + i);

    const forecastCondition = conditions[Math.floor(Math.random() * conditions.length)];

    forecast.push({
      date: forecastDate.toISOString().split('T')[0],
      temp_max: Math.floor(Math.random() * 30) + 5,
      temp_min: Math.floor(Math.random() * 20),
      condition: forecastCondition,
      description: descriptions[forecastCondition],
      icon: `https://openweathermap.org/img/wn/${getRandomIcon(forecastCondition)}@2x.png`
    });
  }

  return {
    current,
    forecast
  };
}

// Helper function for simulation
function getRandomIcon(condition) {
  const iconMapping = {
    'clear': '01d',
    'clouds': '03d',
    'partly cloudy': '02d',
    'rain': '10d',
    'thunderstorm': '11d',
    'snow': '13d',
    'drizzle': '09d',
    'mist': '50d',
    'fog': '50d'
  };

  return iconMapping[condition] || '01d';
}
