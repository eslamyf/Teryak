const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables (from backend/.env or root)
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

const helmet = require('helmet');
const { apiLimiter } = require('./middlewares/rateLimiter');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const pharmacyRoutes = require('./routes/pharmacyRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const donationRoutes = require('./routes/donationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// Disable Express fingerprinting
app.disable('x-powered-by');

// Security Headers via Helmet (with relaxed CSP for CDNs)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// Ensure DB is connected
connectDB().catch((err) => console.error('[Initial DB Error]:', err.message));

// Middleware
app.use(
  cors({
    origin: true, // Allow dynamic origin reflecting for Vercel preview URLs and custom domains
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    maxAge: '30d',
    immutable: true,
  })
);

// Apply general API rate limiting
app.use('/api/', apiLimiter);

// Health Check API (Clean & Standardized Status)
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  const statusCode = isConnected ? 200 : 503;
  res.status(statusCode).json({
    status: isConnected ? 'healthy' : 'degraded',
    message: isConnected ? 'Teryak API is running smoothly' : 'Teryak API is running with database reconnecting',
    database: isConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Middleware to check DB connection for API routes
const checkDbConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    // Attempt background reconnect
    connectDB().catch(() => {});
    return res.status(503).json({
      success: false,
      message: 'الخدمة غير متاحة مؤقتاً، جاري إعادة الاتصال بالخادم. يرجى المحاولة بعد قليل.',
      error: 'Database connection is pending or unavailable.',
    });
  }
  next();
};

// Mount API routes with DB connection check
app.use('/api/auth', checkDbConnection, authRoutes);
app.use('/api/medicines', checkDbConnection, medicineRoutes);
app.use('/api/pharmacies', checkDbConnection, pharmacyRoutes);
app.use('/api/inventory', checkDbConnection, inventoryRoutes);
app.use('/api/orders', checkDbConnection, orderRoutes);
app.use('/api/donations', checkDbConnection, donationRoutes);
app.use('/api/admin', checkDbConnection, adminRoutes);
app.use('/api/upload', checkDbConnection, uploadRoutes);
app.use('/api/notifications', checkDbConnection, notificationRoutes);
app.use('/api/payment', checkDbConnection, paymentRoutes);

// Serve Frontend Static Files with High-Performance Cache Headers for Assets
const frontendPath = path.join(__dirname, '../frontend');
app.use(
  express.static(frontendPath, {
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      if (/\.(png|jpe?g|gif|webp|svg|ico|woff2?|ttf|eot)$/i.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=2592000, stale-while-revalidate=86400');
      } else if (/\.(css|js)$/i.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      }
    },
  })
);

// Serve robots.txt & sitemap.xml
app.get('/robots.txt', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile(path.join(frontendPath, 'robots.txt'));
});

app.get('/sitemap.xml', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.type('application/xml');
  res.sendFile(path.join(frontendPath, 'sitemap.xml'));
});

// Serve platform favicon directly
app.get(['/favicon.ico', '/favicon.png'], (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=2592000');
  res.sendFile(path.join(frontendPath, 'assets', 'images', 'logo.png'));
});

// Fallback for root
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
