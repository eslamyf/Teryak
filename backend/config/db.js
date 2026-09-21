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
  // Ignore if unable to set DNS servers in certain environments
}

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/teryak_db';

  try {
    const opts = {
      bufferCommands: true,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    };

    const conn = await mongoose.connect(uri, opts);
    if (conn && conn.connection && conn.connection.host) {
      cachedConnection = conn;
      console.log(`[MongoDB] Connected successfully to: ${conn.connection.name} (${conn.connection.host})`);
    }
    return cachedConnection;
  } catch (error) {
    console.error(`[MongoDB Error] Connection failed: ${error.message}`);
    console.log(`[MongoDB Info] If local MongoDB is not running, set a free cloud database URI in backend/.env`);
    console.log(`               Example: MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/teryak_db\n`);

    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
};

const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = connectDB;
module.exports.isDbConnected = isDbConnected;
