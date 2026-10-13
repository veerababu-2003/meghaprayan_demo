const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/meghaprayan');
    console.log(`[MeghaPrayan DB] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MeghaPrayan DB Error] ${error.message}`);
    // Allow non-fatal fallback in local dev if MongoDB service is offline, but log warning
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
