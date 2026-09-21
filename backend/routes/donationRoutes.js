const express = require('express');
const router = express.Router();
const {
  getDonations,
  getMyDonations,
  createDonation,
  updateDonationStatus,
} = require('../controllers/donationController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { validateDonation } = require('../middlewares/validationMiddleware');

router.get('/', getDonations);
router.get('/my-donations', protect, getMyDonations);
router.post('/', protect, validateDonation, createDonation);
router.put('/:id/status', protect, authorize('pharmacist', 'admin'), updateDonationStatus);

module.exports = router;
