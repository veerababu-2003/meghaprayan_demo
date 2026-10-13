const express = require('express');
const router = express.Router();
const { searchPlaces, reverseGeocode, detectLocationByIp } = require('../controllers/geocodeController');
const { apiLimiter } = require('../middleware/rateLimiter');

router.get('/search', apiLimiter, searchPlaces);
router.get('/reverse', reverseGeocode);
router.get('/ip-detect', detectLocationByIp);

module.exports = router;
