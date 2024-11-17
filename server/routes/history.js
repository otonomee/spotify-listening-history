// server/routes/api/history.js
const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");

// Get recent listening history
router.get("/recent", requireAuth, async (req, res) => {
  try {
    const data = await req.spotifyApi.getMyRecentlyPlayedTracks({
      limit: 50,
    });

    // Format the response
    const history = data.body.items.map((item) => ({
      trackId: item.track.id,
      trackName: item.track.name,
      artistName: item.track.artists[0].name,
      albumName: item.track.album.name,
      playedAt: item.played_at,
      albumCover: item.track.album.images[0]?.url,
    }));

    res.json(history);
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

module.exports = router;
