const express = require("express");
const router = express.Router();

router.get("/monthly", async (req, res) => {
  res.json({ message: "Monthly playlists endpoint" });
});

module.exports = router; // Export just the router
