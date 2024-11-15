// server/auth/spotifyAuth.js
const express = require("express");
const router = express.Router();
const SpotifyWebApi = require("spotify-web-api-node");

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

// Login route
router.get("/login", (req, res) => {
  const scopes = ["user-read-recently-played", "playlist-modify-public", "playlist-modify-private"];
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  res.redirect(authorizeURL);
});

// Callback route after Spotify auth
router.get("/callback", async (req, res) => {
  const { code } = req.query;

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token } = data.body;

    // Store tokens in session
    req.session.accessToken = access_token;
    req.session.refreshToken = refresh_token;

    // Get user profile
    spotifyApi.setAccessToken(access_token);
    const me = await spotifyApi.getMe();
    req.session.userId = me.body.id;

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Auth Error:", error);
    res.redirect("/auth/login");
  }
});

// Logout route
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
