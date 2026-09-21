const app = require('../app');
const connectDB = require('../config/db');

// Serverless Handler for Vercel
module.exports = async (req, res) => {
  // Ensure database is connected before handling serverless request
  await connectDB();
  return app(req, res);
};
