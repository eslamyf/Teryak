const express = require('express');
const router = express.Router();
const {
  getPharmacies,
  getPharmacyById,
  getMyPharmacy,
  updateMyPharmacy,
} = require('../controllers/pharmacyController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.get('/my-pharmacy', protect, authorize('pharmacist'), getMyPharmacy);
router.put('/my-pharmacy', protect, authorize('pharmacist'), updateMyPharmacy);

router.get('/', getPharmacies);
router.get('/:id', getPharmacyById);

module.exports = router;
