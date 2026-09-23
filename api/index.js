const app = require('../backend/app');
const connectDB = require('../backend/config/db');

// Root Serverless Function for Vercel Fullstack Deployment
module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[Vercel Serverless DB Error]:', err.message);
  }
  return app(req, res);
};
