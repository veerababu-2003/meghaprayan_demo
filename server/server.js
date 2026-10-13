require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const setupLiveTripSocket = require('./sockets/liveTripSocket');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Initialize live trip tracking socket handlers
setupLiveTripSocket(io);

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  MeghaPrayan Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`  Listening on Port: http://localhost:${PORT}`);
  console.log(`  Live Socket.IO gateway active`);
  console.log(`=======================================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Server Unhandled Rejection]: ${err.message}`);
});
