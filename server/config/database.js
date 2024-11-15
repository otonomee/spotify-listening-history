// server/config/database.js
const { MongoClient, ServerApiVersion } = require("mongodb");

if (!process.env.MONGODB_URI) {
  console.error("Available environment variables:", Object.keys(process.env));
  throw new Error("MONGODB_URI environment variable is not set");
}

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const connectDB = async () => {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");
    return client;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

module.exports = { connectDB, client };
