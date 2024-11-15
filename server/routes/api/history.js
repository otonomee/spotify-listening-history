const express = require("express");
const router = express.Router();

router.get("/recent", async (req, res) => {
  res.json({ message: "Recent history endpoint" });
});

module.exports = router;
