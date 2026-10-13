const express = require('express');
const router = express.Router();
const { getCurrentWeather } = require('../controllers/weatherController');

router.get('/current', getCurrentWeather);

module.exports = router;
