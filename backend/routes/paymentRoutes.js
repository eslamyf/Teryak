const express = require('express');
const router = express.Router();
const {
  initiatePayment,
  paymentWebhook,
  verifyPayment,
} = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/initiate', protect, initiatePayment);
router.post('/webhook', paymentWebhook);
router.get('/verify/:orderId', protect, verifyPayment);

module.exports = router;
