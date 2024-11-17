const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");

router.get("/", requireAuth, async (req, res) => {
  try {
    // Get user profile and recent tracks using the API instance from auth middleware
    const [profile, recentTracks] = await Promise.all([req.spotifyApi.getMe(), req.spotifyApi.getMyRecentlyPlayedTracks({ limit: 50 })]);

    // Log the API response for debugging
    console.log("Profile:", profile.body);
    console.log("Recent Tracks:", recentTracks.body);

    // Create a simple HTML display
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Spotify History - ${profile.body.display_name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .track { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
            .timestamp { color: #666; font-size: 0.8em; }
            img { width: 50px; height: 50px; margin-right: 10px; vertical-align: middle; }
          </style>
        </head>
        <body>
          <h1>Welcome, ${profile.body.display_name}</h1>
          <h2>Recently Played Tracks</h2>
          <div id="tracks">
            ${recentTracks.body.items
              .map(
                (item) => `
              <div class="track">
                <img src="${item.track.album.images[2]?.url || ""}" alt="Album art">
                <strong>${item.track.name}</strong>
                by ${item.track.artists.map((artist) => artist.name).join(", ")}
                <br>
                <span class="timestamp">
                  Played at: ${new Date(item.played_at).toLocaleString()}
                </span>
                <br>
                Album: ${item.track.album.name}
              </div>
            `
              )
              .join("")}
          </div>
          <hr>
          <pre>
            Debug Data:
            ${JSON.stringify(recentTracks.body.items[0], null, 2)}
          </pre>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Dashboard Error:", error);
    console.error("Error details:", {
      message: error.message,
      statusCode: error.statusCode,
      body: error.body,
    });
    res.redirect("/auth/login");
  }
});

module.exports = router;
