require("dotenv").config();
const express = require("express");
const session = require("express-session");
const SpotifyWebApi = require("spotify-web-api-node");
const { connectDB, client } = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3000;

// Debug middleware
app.use((req, res, next) => {
  console.log("Request:", req.method, req.url);
  next();
});

// Connect to MongoDB
connectDB()
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  });

// Middleware
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "spotify-history-secret-key-1234",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Routes - updated to match your directory structure
app.use("/auth", require("./auth/spotifyAuth"));
app.use("/history", require("./routes/history")); // removed /api
app.use("/playlists", require("./routes/playlists")); // removed /api
app.use("/dashboard", require("./routes/dashboard"));

// Landing page
app.get("/", (req, res) => {
  res.send(`
    <h1>Spotify Listening History</h1>
    <a href="/auth/login">Login with Spotify</a>
  `);
});

// Error handling
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
