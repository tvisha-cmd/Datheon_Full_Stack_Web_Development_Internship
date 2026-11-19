// ---------- 1. FIND THE ELEMENTS ----------
const form = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const searchButton = form.querySelector("button");

const loading = document.getElementById("loading");
const errorBox = document.getElementById("error");
const weatherBox = document.getElementById("weather");

const cityName = document.getElementById("city-name");
const localDate = document.getElementById("local-date");
const weatherIcon = document.getElementById("weather-icon");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const pressure = document.getElementById("pressure");
const forecast = document.getElementById("forecast");

// ---------- 2. WEATHER CODES ----------
// Open-Meteo describes the weather with a number. This table turns it into text and an emoji.
function describeWeather(code) {
  if (code === 0)  return { text: "Clear sky", icon: "☀️" };
  if (code === 1)  return { text: "Mainly clear", icon: "🌤️" };
  if (code === 2)  return { text: "Partly cloudy", icon: "⛅" };
  if (code === 3)  return { text: "Overcast", icon: "☁️" };
  if (code === 45 || code === 48) return { text: "Foggy", icon: "🌫️" };
  if (code >= 51 && code <= 57)   return { text: "Drizzle", icon: "🌦️" };
  if (code >= 61 && code <= 67)   return { text: "Rain", icon: "🌧️" };
  if (code >= 71 && code <= 77)   return { text: "Snow", icon: "❄️" };
  if (code >= 80 && code <= 82)   return { text: "Rain showers", icon: "🌦️" };
  if (code === 85 || code === 86) return { text: "Snow showers", icon: "🌨️" };
  if (code >= 95)                 return { text: "Thunderstorm", icon: "⛈️" };
  return { text: "Unknown", icon: "🌡️" };
}

// ---------- 3. BACKGROUND THEME ----------
function getTheme(code, isDay) {
  if (!isDay) return "theme-night";
  if (code >= 95) return "theme-stormy";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "theme-snowy";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "theme-rainy";
  if (code === 2 || code === 3 || code === 45 || code === 48) return "theme-cloudy";
  return "theme-sunny";
}

function setTheme(themeClass) {
  document.body.className = themeClass;   // replaces any old theme class
}

// ---------- 4. SHOW / HIDE HELPERS ----------
function showLoading() {
  loading.classList.remove("hidden");
  errorBox.classList.add("hidden");
  weatherBox.classList.add("hidden");
  searchButton.disabled = true;           // stops double clicks while loading
}

function hideLoading() {
  loading.classList.add("hidden");
  searchButton.disabled = false;
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
  weatherBox.classList.add("hidden");
}

// ---------- 5. TALK TO THE API ----------
// Step A: turn a city name into coordinates
async function getCoordinates(city) {
  const url = "https://geocoding-api.open-meteo.com/v1/search?name="
    + encodeURIComponent(city)            // makes the city safe to put in a web address
    + "&count=1&language=en&format=json";

  const response = await fetch(url);
  if (!response.ok) throw new Error("SERVER");

  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error("NOT_FOUND");         // the API found no city with that name
  }
  return data.results[0];
}

// Step B: get the weather for those coordinates
async function getWeather(latitude, longitude) {
  const url = "https://api.open-meteo.com/v1/forecast"
    + "?latitude=" + latitude
    + "&longitude=" + longitude
    + "&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,weather_code,is_day"
    + "&daily=weather_code,temperature_2m_max,temperature_2m_min"
    + "&timezone=auto&forecast_days=5";

  const response = await fetch(url);
  if (!response.ok) throw new Error("SERVER");
  return await response.json();
}

// ---------- 6. SHOW THE RESULT ON THE PAGE ----------
function showWeather(place, data) {
  const current = data.current;
  const info = describeWeather(current.weather_code);

  // city name (and country if the API gave one)
  cityName.textContent = place.country ? place.name + ", " + place.country : place.name;

  // date and time in that city (the API already gives local time)
  localDate.textContent = new Date(current.time).toLocaleString(undefined, {
    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit"
  });

  weatherIcon.textContent = info.icon;
  temperature.textContent = Math.round(current.temperature_2m) + "°C";
  condition.textContent = info.text;

  humidity.textContent = current.relative_humidity_2m + "%";
  wind.textContent = Math.round(current.wind_speed_10m) + " km/h";
  pressure.textContent = Math.round(current.surface_pressure) + " hPa";

  // 5-day forecast: Array.map() turns each day into a card of HTML
  const cards = data.daily.time.map(function (date, i) {
    const dayInfo = describeWeather(data.daily.weather_code[i]);
    const dayName = new Date(date + "T00:00:00").toLocaleDateString(undefined, { weekday: "short" });
    const max = Math.round(data.daily.temperature_2m_max[i]);
    const min = Math.round(data.daily.temperature_2m_min[i]);

    return '<div class="forecast-card">'
      + '<span class="forecast-day">' + dayName + '</span>'
      + '<span class="forecast-icon">' + dayInfo.icon + '</span>'
      + '<span class="forecast-temp">' + max + '° / ' + min + '°</span>'
      + '</div>';
  });
  forecast.innerHTML = cards.join("");

  // change the background to match the weather
  setTheme(getTheme(current.weather_code, current.is_day === 1));

  weatherBox.classList.remove("hidden");
  errorBox.classList.add("hidden");
}

// ---------- 7. THE MAIN FUNCTION: search for a city ----------
async function searchCity(city) {
  showLoading();

  try {
    const place = await getCoordinates(city);
    const data = await getWeather(place.latitude, place.longitude);
    showWeather(place, data);
  } catch (error) {
    // the error message tells us what went wrong
    if (error.message === "NOT_FOUND") {
      showError("City not found. Check the spelling and try again.");
    } else if (error.message === "SERVER") {
      showError("The weather service had a problem. Please try again in a moment.");
    } else {
      showError("Could not connect. Check your internet connection and try again.");
    }
  } finally {
    hideLoading();                        // runs whether it worked or failed
  }
}

// ---------- 8. WHEN THE USER SUBMITS THE FORM ----------
form.addEventListener("submit", function (event) {
  event.preventDefault();                 // stop the page from reloading
  const city = cityInput.value.trim();
  if (city === "") return;
  searchCity(city);
});