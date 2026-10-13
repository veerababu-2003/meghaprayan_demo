const express = require('express');
const router = express.Router();
const { calculateRoutes } = require('../controllers/routeController');
const { apiLimiter } = require('../middleware/rateLimiter');

router.post('/calculate', apiLimiter, calculateRoutes);

module.exports = router;
