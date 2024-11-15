const express = require('express');
const router = express.Router();

router.get('/monthly', async (req, res) => {
  // Implementation coming soon
  res.json({ message: 'Monthly playlists endpoint' });
});

module.exports = router;
