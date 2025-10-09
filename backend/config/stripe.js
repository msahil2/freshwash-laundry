//const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

//module.exports = stripe;
// Demo Mode - No Stripe Configuration Needed
// This file is kept for backward compatibility but does not use Stripe

const demoStripeConfig = {
  isDemo: true,
  message: 'Running in demo payment mode - no real payments processed'
};

console.log('💳 Payment System: DEMO MODE (No Stripe)');

// Export empty object to prevent errors
module.exports = demoStripeConfig;