// server/middleware/auth.js
const SpotifyWebApi = require('spotify-web-api-node');

const requireAuth = async (req, res, next) => {
  if (!req.session.accessToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI
  });

  spotifyApi.setAccessToken(req.session.accessToken);
  spotifyApi.setRefreshToken(req.session.refreshToken);

  try {
    await spotifyApi.getMe();
    req.spotifyApi = spotifyApi;
    next();
  } catch (error) {
    if (error.statusCode === 401) {
      try {
        const data = await spotifyApi.refreshAccessToken();
        const { access_token } = data.body;
        req.session.accessToken = access_token;
        spotifyApi.setAccessToken(access_token);
        req.spotifyApi = spotifyApi;
        next();
      } catch (refreshError) {
        res.status(401).json({ error: 'Session expired' });
      }
    } else {
      res.status(500).json({ error: 'Authentication error' });
    }
  }
};

module.exports = { requireAuth };
