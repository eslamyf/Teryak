const mongoose = require('mongoose');
const dns = require('dns');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables if not already loaded
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

// Configure public DNS servers ONLY in local dev environment.
// In AWS Lambda / Vercel Serverless, overriding DNS with 8.8.8.8 causes SRV lookup timeouts.
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
if (!isServerless && process.env.NODE_ENV !== 'production') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  } catch (e) {
    // Ignore in restricted local environments
  }
}

/**
 * Global cache for Mongoose connection across serverless lambda invocations (Vercel)
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // If already connected and connection is alive, return cached instance
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Support all common environment variable naming standards
  const uri = process.env.MONGODB_URI || 
              process.env.MONGO_URI || 
              process.env.DATABASE_URL || 
              'mongodb://127.0.0.1:27017/teryak_db';

  if (isServerless && uri.includes('127.0.0.1')) {
    console.warn('[MongoDB Critical Warning]: Running in serverless/Vercel environment but MONGODB_URI is not set in Environment Variables! Localhost 127.0.0.1 will fail.');
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
      maxPoolSize: isServerless ? 2 : 10, // Optimize connection pooling for serverless
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log(`[MongoDB] Connected successfully to database: ${mongooseInstance.connection.name}`);
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error(`[MongoDB Error] Connection failed: ${error.message}`);
    throw error;
  }
};

const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = connectDB;
module.exports.isDbConnected = isDbConnected;
