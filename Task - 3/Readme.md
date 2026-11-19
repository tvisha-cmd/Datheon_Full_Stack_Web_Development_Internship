# Task 3: Real-Time Weather Forecast and Climate Telemetry App

A weather dashboard built with HTML, CSS and vanilla JavaScript. Search for any city in the world and get the current weather and a 5-day forecast. Data is loaded live from a third-party REST API using `fetch()` with `async/await`.

**Live demo:** https://tvisha-cmd.github.io/Datheon_Full_Stack_Web_Development_Internship/Task%20-%203/

## Features
- Search any global city by name
- Current temperature, weather conditions, humidity, wind speed and atmospheric pressure
- Dynamic weather icons (sunny, cloudy, rain, snow, storm, fog)
- 5-day forecast cards with daily high and low temperatures
- Background gradient changes with the weather and time of day (sunny, cloudy, rainy, snowy, stormy, night)
- Loading spinner while data is being fetched
- Friendly error messages for unknown cities, server problems and no internet connection
- Responsive layout for phones and computers

## API used
The app uses the free [Open-Meteo](https://open-meteo.com/) APIs:
- **Geocoding API** turns a city name into coordinates
- **Forecast API** returns current weather and the daily forecast for those coordinates

Open-Meteo needs no API key, so no secret key is stored in this public repository.

## How it works
1. The user submits a city name.
2. `getCoordinates()` calls the geocoding