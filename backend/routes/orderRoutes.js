const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getPharmacyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/orderController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { validateOrder } = require('../middlewares/validationMiddleware');

router.use(protect);

router.post('/', validateOrder, createOrder);
router.get('/my-orders', getMyOrders);
router.get('/pharmacy', authorize('pharmacist', 'admin'), getPharmacyOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', authorize('pharmacist', 'admin'), updateOrderStatus);
router.put('/:id/cancel', cancelOrder);

module.exports = router;
