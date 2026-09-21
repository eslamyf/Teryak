const express = require('express');
const router = express.Router();
const {
  getMyInventory,
  addToInventory,
  updateInventoryItem,
  deleteInventoryItem,
  getLowStockItems,
} = require('../controllers/inventoryController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { validateInventory } = require('../middlewares/validationMiddleware');

router.use(protect);
router.use(authorize('pharmacist', 'admin'));

router.get('/low-stock', getLowStockItems);

router.route('/')
  .get(getMyInventory)
  .post(validateInventory, addToInventory);

router.route('/:id')
  .put(validateInventory, updateInventoryItem)
  .delete(deleteInventoryItem);

module.exports = router;
