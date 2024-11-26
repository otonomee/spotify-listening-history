// server/services/tokenManager.js
const SpotifyWebApi = require("spotify-web-api-node");
const User = require("../models/User");

// Create a new Spotify API instance with user tokens
function createSpotifyApi(user) {
  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI,
  });

  spotifyApi.setAccessToken(user.accessToken);
  spotifyApi.setRefreshToken(user.refreshToken);

  return spotifyApi;
}

// Check and refresh token if needed
async function getValidSpotifyApi(userId) {
  try {
    const user = await User.findOne({ spotifyId: userId });
    if (!user) {
      throw new Error("User not found");
    }

    // Check if token is expired or will expire soon (within 5 minutes)
    const tokenExpiresIn = user.tokenExpires.getTime() - Date.now();
    if (tokenExpiresIn <= 300000) {
      // 5 minutes in milliseconds
      console.log("Token expired or expiring soon, refreshing...");

      const spotifyApi = createSpotifyApi(user);
      const data = await spotifyApi.refreshAccessToken();

      // Update user with new token
      user.accessToken = data.body.access_token;
      if (data.body.refresh_token) {
        user.refreshToken = data.body.refresh_token;
      }
      user.tokenExpires = new Date(Date.now() + data.body.expires_in * 1000);
      await user.save();

      // Return new API instance with fresh tokens
      return createSpotifyApi(user);
    }

    // Token is still valid
    return createSpotifyApi(user);
  } catch (error) {
    console.error("Token refresh error:", error);
    throw error;
  }
}

module.exports = {
  getValidSpotifyApi,
};
