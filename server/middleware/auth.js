const SpotifyWebApi = require("spotify-web-api-node");

const requireAuth = async (req, res, next) => {
  if (!req.session.accessToken) {
    return res.redirect("/auth/login");
  }

  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI,
  });

  spotifyApi.setAccessToken(req.session.accessToken);
  spotifyApi.setRefreshToken(req.session.refreshToken);

  try {
    // Verify the access token by making a simple request
    await spotifyApi.getMe();
    req.spotifyApi = spotifyApi;
    next();
  } catch (error) {
    if (error.statusCode === 401) {
      // Access token has expired, try to refresh it
      try {
        const data = await spotifyApi.refreshAccessToken();
        const { access_token } = data.body;
        req.session.accessToken = access_token;
        spotifyApi.setAccessToken(access_token);
        req.spotifyApi = spotifyApi;
        next();
      } catch (refreshError) {
        console.error("Error refreshing access token:", refreshError);
        return res.redirect("/auth/login");
      }
    } else {
      console.error("Auth error:", error);
      return res.redirect("/auth/login");
    }
  }
};

module.exports = { requireAuth };
