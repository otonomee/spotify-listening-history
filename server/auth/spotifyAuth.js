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
  const scopes = ["user-read-email", "user-read-private", "user-read-recently-played", "playlist-modify-public", "playlist-modify-private"];
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  res.redirect(authorizeURL);
});

router.get("/callback", async (req, res) => {
  const { code } = req.query;

  try {
    // Get tokens
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token, expires_in } = data.body;

    // Get user profile
    spotifyApi.setAccessToken(access_token);
    const me = await spotifyApi.getMe();

    // Save/update user in database
    await User.findOneAndUpdate(
      { spotifyId: me.body.id },
      {
        spotifyId: me.body.id,
        displayName: me.body.display_name,
        email: me.body.email,
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpires: new Date(Date.now() + expires_in * 1000),
      },
      { upsert: true, new: true }
    );

    // Set session
    req.session.userId = me.body.id;
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Auth error:", error);
    res.redirect("/auth/login");
  }
});

module.exports = router;
