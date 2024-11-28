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
