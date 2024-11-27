require("dotenv").config();
const express = require("express");
const session = require("express-session");
const SpotifyWebApi = require("spotify-web-api-node");
const { connectDB, client } = require("./config/database");
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 3000;

// Debug middleware to log requests (excluding Next.js HMR)
app.use((req, res, next) => {
  if (!req.path.includes("/_next")) {
    console.log(`${req.method} ${req.path}`);
  }
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

// Debug route to check users
app.get("/api/debug/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.json({
      userCount: users.length,
      users: users.map((u) => ({
        id: u.spotifyId,
        name: u.displayName,
        hasTokens: !!u.accessToken && !!u.refreshToken,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
