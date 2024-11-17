const express = require("express");
const router = express.Router();
const SpotifyWebApi = require("spotify-web-api-node");

console.log("Configuring Spotify API with:", {
  clientId: process.env.SPOTIFY_CLIENT_ID,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

router.get("/login", (req, res) => {
  const scopes = ["user-read-recently-played", "playlist-modify-public", "playlist-modify-private"];
  console.log("Starting login with redirect URI:", process.env.SPOTIFY_REDIRECT_URI);
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  console.log("Generated authorize URL:", authorizeURL);
  res.redirect(authorizeURL);
});

router.get("/callback", async (req, res) => {
  const { code } = req.query;

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token, expires_in } = data.body;

    // Store tokens in session
    req.session.accessToken = access_token;
    req.session.refreshToken = refresh_token;
    req.session.expiresIn = expires_in;
    req.session.tokenTimestamp = Date.now();

    // Get user profile
    spotifyApi.setAccessToken(access_token);
    const me = await spotifyApi.getMe();
    req.session.userId = me.body.id;

    console.log("User authenticated:", me.body);

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Auth Error:", error);
    res.redirect("/auth/login");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
    res.redirect("/");
  });
});

module.exports = router;
