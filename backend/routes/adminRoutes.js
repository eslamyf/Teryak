const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getPendingPharmacies,
  approvePharmacy,
  getReports,
} = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard-stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.get('/pharmacies/pending', getPendingPharmacies);
router.put('/pharmacies/:id/approve', approvePharmacy);
router.get('/reports', getReports);

module.exports = router;
