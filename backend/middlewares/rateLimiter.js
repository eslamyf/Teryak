const rateLimit = require('express-rate-limit');

// General API Rate Limiter: 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'تم تجاوز الحد الأقصى لعدد الطلبات، يرجى المحاولة بعد 15 دقيقة',
    error: 'Too many requests, please try again later.',
  },
});

// Stricter Rate Limiter for Auth (Login, Register): 20 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'تم تجاوز الحد الأقصى لمحاولات تسجيل الدخول، يرجى المحاولة بعد قليل',
    error: 'Too many authentication attempts, please try again later.',
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
};
