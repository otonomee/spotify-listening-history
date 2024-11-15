const express = require("express");
const router = express.Router();

router.get("/me", async (req, res) => {
  res.json({ message: "User profile endpoint" });
});

module.exports = router; // Export just the router
