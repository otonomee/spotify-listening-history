// server/app.js
const express = require("express");
const session = require("express-session");
const { connectDB } = require("./config/database");
const authRouter = require("./auth/spotifyAuth");
const historyRouter = require("./routes/api/history");
const playlistsRouter = require("./routes/api/playlists");
const userRouter = require("./routes/api/user");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB().catch(console.dir);

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

// Routes
app.use("/auth", authRouter);
app.use("/api/history", historyRouter);
app.use("/api/playlists", playlistsRouter);
app.use("/api/user", userRouter);

app.get("/", (req, res) => {
  res.send("Spotify Listening History API");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
