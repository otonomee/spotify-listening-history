// server/auth/spotifyAuth.js
const express = require("express");
const router = express.Router();
const SpotifyWebApi = require("spotify-web-api-node");

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

router.get("/spotify", (req, res) => {
  const scopes = ["user-read-recently-played", "playlist-modify-public", "playlist-modify-private"];
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  res.redirect(authorizeURL);
});

router.get("/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token } = data.body;

    spotifyApi.setAccessToken(access_token);
    const profile = await spotifyApi.getMe();

    // Store in session
    req.session.userId = profile.body.id;
    req.session.accessToken = access_token;
    req.session.refreshToken = refresh_token;

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Auth Error:", error);
    res.redirect("/error");
  }
});

module.exports = { router, spotifyApi };
