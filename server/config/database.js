// server/config/database.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Increased timeout
      heartbeatFrequencyMS: 2000, // More frequent heartbeats
    });

    // Test the connection with a simple operation
    await mongoose.connection.db.admin().ping();
    console.log("MongoDB Connected and operational");

    return mongoose.connection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = { connectDB, mongoose };
