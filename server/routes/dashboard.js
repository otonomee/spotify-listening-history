// server/routes/dashboard.js
const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");

router.get("/", requireAuth, async (req, res) => {
  try {
    const recentTracks = await req.spotifyApi.getMyRecentlyPlayedTracks({
      limit: 20,
    });

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Spotify History Dashboard</title>
          <style>
            body { 
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .track {
              padding: 10px;
              margin: 10px 0;
              border: 1px solid #ddd;
              border-radius: 4px;
            }
            .track img {
              width: 50px;
              height: 50px;
              margin-right: 10px;
              vertical-align: middle;
            }
          </style>
        </head>
        <body>
          <h1>Your Recent Tracks</h1>
          <div id="tracks">
            ${recentTracks.body.items
              .map(
                (item) => `
              <div class="track">
                <img src="${item.track.album.images[2]?.url || ""}" alt="Album art">
                <strong>${item.track.name}</strong> 
                by ${item.track.artists[0].name}
                <br>
                <small>Played at: ${new Date(item.played_at).toLocaleString()}</small>
              </div>
            `
              )
              .join("")}
          </div>
          <div>
            <a href="/auth/logout">Logout</a>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Dashboard error:", error);
    res.redirect("/auth/login");
  }
});

module.exports = router;
