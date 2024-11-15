const express = require('express');
const router = express.Router();

router.get('/me', async (req, res) => {
  // Implementation coming soon
  res.json({ message: 'User profile endpoint' });
});

module.exports = router;
