import * as helpers from '../helpers.js';
import axios from 'axios';
import { weatherData } from './index.js';

const BASE_URL = 'http://api.openweathermap.org/';
const API_KEY = '620ef0233e71e5d9c383aabbb157a0a7';

// Gets the latitude and longitude of a given zip code
const getLatLong = async (zipCode) => {
    // Input validation
    helpers.isValidZip(zipCode);
    zipCode = zipCode.trim();
    const countryCode = 'US';

    // Fetch lat and long from API
    const url = `${BASE_URL}data/2.5/weather?zip=${zipCode},${countryCode}&appid=${API_KEY}`;
    const response = await axios.get(url);
    const coords = response.data.coord;

    return coords;
};

// Gets the weather for the next 5 days in a given zip code
const getWeather = async (zipCode) => {
    const { lat, lon } = await getLatLong(zipCode);

    // Fetch weather from API
    const url = `${BASE_URL}data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`;

    const response = await axios.get(url);
    const data = response.data;

    const cleanedData = cleanWeatherData(data.list);

    return cleanedData;
};

const cleanWeatherData = (weatherData) => {
    let cleanedData = [];

    for (const day of weatherData) {
        const date = day.dt_txt.split(' ')[0];
        const time = day.dt_txt.split(' ')[1];
        const temp = day.main.temp;
        const weather = day.weather[0].main;
        const wind = day.wind.speed;
        const icon = day.weather[0].icon;

        cleanedData.push({ date, time, temp, weather, wind, icon });
    }

    const dailyData = convertToDaily(cleanedData);
    return dailyData;
};

const convertToDaily = (weatherData) => {
    let dailyData = [];

    for (const day of weatherData) {
        if (day.time === '12:00:00') {
            dailyData.push(day);
        }
    }

    return dailyData;
};

export default { getWeather, getLatLong };
