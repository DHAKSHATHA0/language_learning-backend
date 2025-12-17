const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully');
    isConnected = true;
    console.log('[DEBUG] isConnected set to:', isConnected);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⚠️  Running in mock mode - authentication will work without database');
    // Don't exit, continue running in mock mode
  }
};

const getIsConnected = () => {
  console.log('[DEBUG] getIsConnected returning:', isConnected);
  return isConnected;
};

module.exports = { connectDB, getIsConnected };
