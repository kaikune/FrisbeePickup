import { Router } from 'express';

import { weatherData } from '../data/index.js';
import * as helpers from '../helpers.js';
const router = Router();

// Takes in a gameLocation object and returns the weather for that location
router
    .route('/')
    .post(async (req, res) => {
        // Input validation
        const location = req.body.gameLocation;
        try {
            helpers.validateLocation(location);
        } catch (e) {
            return res.status(400).json({ error: e });
        }

        try {
            const weather = await weatherData.getWeather(location.zip);
            return res.json(weather);
        } catch (e) {
            return res.status(400).json({ error: e });
        }
    })

export default router;
