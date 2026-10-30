const path = require('path');
const { errorResponse } = require('../utils/apiResponse');

const notFound = (req, res, next) => {
  const url = req.originalUrl || req.url || '';
  const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');
  const isSpaRequest = req.headers['x-requested-with'] === 'Teryak-SPA-Router';

  // Return JSON 404 only for /api/* routes or explicit non-HTML API requests
  if (url.startsWith('/api/') || url === '/api' || (!acceptsHtml && !isSpaRequest && /\.(js|css|json|png|jpg|jpeg|svg|ico|webp|woff2?)$/i.test(url))) {
    return errorResponse(res, 404, `Route not found: ${url}`);
  }

  // Serve the branded 404 HTML page (with Navbar & Footer) for all invalid browser routes
  const notFoundPagePath = path.join(__dirname, '../../frontend/404.html');
  return res.status(404).sendFile(notFoundPagePath, (err) => {
    if (err) {
      return errorResponse(res, 404, `Route not found: ${url}`);
    }
  });
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // MongoDB connection offline error
  if (
    err.name === 'MongooseError' ||
    err.name === 'MongoServerSelectionError' ||
    err.name === 'MongoNetworkError' ||
    err.message?.includes('ECONNREFUSED') ||
    err.message?.includes('initial connection is complete') ||
    err.message?.includes('buffering timed out')
  ) {
    statusCode = 503;
    message = 'Database is currently offline. Please verify MongoDB is running or configure MONGODB_URI in backend/.env';
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found (invalid ID format)';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value entered for ${field}. It must be unique.`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors || {})
      .map((val) => val.message)
      .join(', ');
  }

  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message);

  return errorResponse(
    res,
    statusCode,
    message,
    process.env.NODE_ENV === 'production' ? null : (err.errors || null)
  );
};

module.exports = { notFound, errorHandler };
