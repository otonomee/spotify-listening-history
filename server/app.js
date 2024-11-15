require("dotenv").config();
const express = require("express");
const session = require("express-session");
const { connectDB, client } = require("./config/database");
const authRoutes = require("./auth/spotifyAuth");

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
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
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Landing page
app.get("/", (req, res) => {
  res.send(`
    <h1>Spotify Listening History</h1>
    <a href="/auth/login">Login with Spotify</a>
  `);
});

// Routes
app.use("/auth", authRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
