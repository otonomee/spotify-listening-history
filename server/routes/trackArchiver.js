const express = require("express");
const router = express.Router();
const { fetchAndArchiveTracks } = require("../services/trackArchiver");
const User = require("../models/User"); // Import User model

// Minimal endpoint to trigger archiving
router.post("/archive-tracks", async (req, res) => {
  try {
    const userId = req.session.userId; // Assuming you store user ID in session
    const user = await User.findOne({ spotifyId: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    await fetchAndArchiveTracks(user); // Call the function to fetch and archive tracks
    res.status(200).json({ message: "Track archiving process started." });
  } catch (error) {
    console.error("Error starting track archiving:", error);
    res.status(500).json({ message: "Failed to start track archiving." });
  }
});

module.exports = router;
