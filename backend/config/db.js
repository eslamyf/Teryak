const mongoose = require('mongoose');

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
