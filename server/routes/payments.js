const express = require('express');
const router = express.Router();
const { createCheckoutSession, retrieveSession } = require('../services/stripeService');

router.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await createCheckoutSession();
    res.json({ clientSecret: session.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/session-status', async (req, res) => {
  try {
    const session = await retrieveSession(req.query.session_id);
    res.json({
      status: session.status,
      customer_email: session.customer_details?.email
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
