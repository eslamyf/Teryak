const mongoose = require('mongoose');
const dns = require('dns');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables if not already loaded
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

// Configure public DNS servers for resolving MongoDB Atlas SRV records reliably
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Ignore if unable to set DNS servers in restricted environments
}

/**
 * Global cache for Mongoose connection to reuse connection across
 * serverless lambda invocations (Vercel) and local reloads.
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

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/teryak_db';

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Do not buffer operations if connection fails
      serverSelectionTimeoutMS: 7000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log(`[MongoDB] Connected successfully to: ${mongooseInstance.connection.name} (${mongooseInstance.connection.host})`);
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error(`[MongoDB Error] Connection failed: ${error.message}`);
    console.log(`[MongoDB Info] If using MongoDB Atlas, verify that your IP is whitelisted (0.0.0.0/0 in Network Access)`);
    console.log(`               Or set a free database URI in backend/.env`);
    console.log(`               Example: MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/teryak_db\n`);
    throw error;
  }
};

const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = connectDB;
module.exports.isDbConnected = isDbConnected;
