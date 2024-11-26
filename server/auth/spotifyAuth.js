// server/auth/spotifyAuth.js
const express = require("express");
const router = express.Router();
const SpotifyWebApi = require("spotify-web-api-node");
const User = require("../models/User");

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

router.get("/login", (req, res) => {
  const scopes = [
    "playlist-read-private",
    "playlist-read-collaborative",
    "user-read-email",
    "user-read-private",
    "user-read-recently-played",
    "playlist-modify-public",
    "playlist-modify-private",
  ];
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  res.redirect(authorizeURL);
});

router.get("/callback", async (req, res) => {
  const { code } = req.query;

  try {
    console.log("Starting auth code grant...");
    const data = await spotifyApi.authorizationCodeGrant(code);
    console.log("Got tokens:", { expires_in: data.body.expires_in });

    const { access_token, refresh_token, expires_in } = data.body;
    spotifyApi.setAccessToken(access_token);

    console.log("Getting user profile...");
    const me = await spotifyApi.getMe();
    console.log("Got profile:", { id: me.body.id, name: me.body.display_name });

    // Try creating a new user document first
    console.log("Creating/updating user...");
    const userData = {
      spotifyId: me.body.id,
      displayName: me.body.display_name,
      email: me.body.email,
      accessToken: access_token,
      refreshToken: refresh_token,
      tokenExpires: new Date(Date.now() + expires_in * 1000),
    };

    // Try direct save first
    let user = new User(userData);
    try {
      user = await user.save();
    } catch (saveError) {
      if (saveError.code === 11000) {
        // Duplicate key error
        user = await User.findOneAndUpdate({ spotifyId: me.body.id }, userData, { new: true, upsert: true });
      } else {
        throw saveError;
      }
    }

    console.log("User saved:", user.spotifyId);
    req.session.userId = me.body.id;
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Detailed auth error:", {
      name: error.name,
      message: error.message,
      code: error.code,
    });
    res.redirect("/auth/login");
  }
});

// Add logout route
router.get("/logout", (req, res) => {
  // Clear the session
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
    }
    // Redirect to home page
    res.redirect("/");
  });
});

module.exports = router;
