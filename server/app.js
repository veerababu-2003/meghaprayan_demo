const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const errorHandler = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const tripRoutes = require('./routes/tripRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const routeRoutes = require('./routes/routeRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const geocodeRoutes = require('./routes/geocodeRoutes');

const app = express();

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Cross Origin Resource Sharing (allows localhost, 127.0.0.1, and local LAN IP for mobile devices)
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, Postman) or local LAN/localhost
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('192.168.')) {
      return callback(null, true);
    }
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser for silent refresh tokens
app.use(cookieParser());

// Sanitize MongoDB inputs against operator injection
app.use(mongoSanitize());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    product: 'MeghaPrayan',
    tagline: 'Smart journeys powered by weather, routes, and real-time travel intelligence',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/geocode', geocodeRoutes);

// Catch 404 for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
