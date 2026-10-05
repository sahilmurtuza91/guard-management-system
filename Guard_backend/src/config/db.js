const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    await mongoose.connect(uri);
    console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error after initial connect:', err.message);
    });

    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
};

module.exports = connectDB;
