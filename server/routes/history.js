// server/routes/history.js
const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const { archiveRecentTracks } = require("../services/trackArchiver");
const ListeningHistory = require("../models/ListeningHistory"); // one level up from routes

// Get history
router.get("/", requireAuth, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const tracks = await ListeningHistory.find({ userId: req.session.userId }).sort({ playedAt: -1 }).skip(parseInt(offset)).limit(parseInt(limit));

    res.json(tracks);
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// Force sync
router.post("/sync", requireAuth, async (req, res) => {
  try {
    const result = await archiveRecentTracks(req.spotifyApi, req.session.userId);
    res.json(result);
  } catch (error) {
    console.error("Error syncing tracks:", error);
    res.status(500).json({ error: "Failed to sync tracks" });
  }
});

module.exports = router;
