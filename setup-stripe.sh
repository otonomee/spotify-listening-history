#!/bin/bash

# Create directories if they don't exist
mkdir -p client/app/components/ui
mkdir -p client/app/pages
mkdir -p server/services
mkdir -p server/routes

# Create Stripe service
cat > server/services/stripeService.js << 'EOL'
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async () => {
  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'payment',
      return_url: `${process.env.CLIENT_URL}/payment-return?session_id={CHECKOUT_SESSION_ID}`,
    });
    return session;
  } catch (error) {
    console.error('Stripe session creation error:', error);
    throw error;
  }
};

const retrieveSession = async (sessionId) => {
  try {
    return await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    console.error('Stripe session retrieval error:', error);
    throw error;
  }
};

module.exports = {
  createCheckoutSession,
  retrieveSession
};
EOL

# Create payment routes
cat > server/routes/payments.js << 'EOL'
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
EOL