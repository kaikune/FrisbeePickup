import * as helpers from '../helpers.js';
import axios from 'axios';

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
    const url = `${BASE_URL}data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    const response = await axios.get(url);
    const data = response.data;

    return data.list;
};

export default { getWeather, getLatLong };
