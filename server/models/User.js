// server/models/User.js
const { mongoose } = require("../config/database");

const userSchema = new mongoose.Schema(
  {
    spotifyId: String,
    displayName: String,
    email: String,
    accessToken: String,
    refreshToken: String,
    tokenExpires: Date,
  },
  {
    timestamps: true,
    // Add this to ensure indexes are created
    autoIndex: true,
    // Add this to ensure proper collection name
    collection: "users",
  }
);

// Create indexes
userSchema.index({ spotifyId: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);

// Test the model
User.createCollection()
  .then(() => {
    console.log("User collection initialized");
  })
  .catch((err) => {
    console.error("Error initializing User collection:", err);
  });

module.exports = User;
