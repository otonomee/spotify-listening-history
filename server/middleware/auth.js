// server/middleware/auth.js
const SpotifyWebApi = require("spotify-web-api-node");
const User = require("../models/User");

const requireAuth = async (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect("/auth/login");
  }

  try {
    // Get user from database
    const user = await User.findOne({ spotifyId: req.session.userId });
    if (!user) {
      return res.redirect("/auth/login");
    }

    // Create Spotify API instance with user's tokens
    const spotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.SPOTIFY_REDIRECT_URI,
    });

    spotifyApi.setAccessToken(user.accessToken);
    spotifyApi.setRefreshToken(user.refreshToken);

    // Attach to request for use in routes
    req.spotifyApi = spotifyApi;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.redirect("/auth/login");
  }
};

module.exports = { requireAuth };
