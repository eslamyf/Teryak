const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const Order = require('../models/Order');
const Donation = require('../models/Donation');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get Admin Dashboard Stats & Chart Data
// @route   GET /api/admin/dashboard-stats
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalPharmacists = await User.countDocuments({ role: 'pharmacist' });
    const totalPharmacies = await Pharmacy.countDocuments();
    const activePharmacies = await Pharmacy.countDocuments({ isApproved: true });
    const pendingPharmacies = await Pharmacy.countDocuments({ isApproved: false });
    const totalMedicines = await Medicine.countDocuments();
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const totalDonations = await Donation.countDocuments();

    // Calculate revenue
    const revenueAgg = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Weekly stats for charts
    const arabicDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const newUsersChartData = [40, 65, 55, 80, 72, 30, 48];
    const weeklyBookingsChartData = [75, 105, 90, 130, 125, 65, 85];

    return successResponse(res, 200, 'تم جلب إحصائيات لوحة التحكم', {
      counts: {
        totalUsers,
        totalPatients,
        totalPharmacists,
        totalPharmacies,
        activePharmacies,
        pendingPharmacies,
        totalMedicines,
        totalOrders,
        completedOrders,
        pendingOrders,
        totalDonations,
        totalRevenue,
      },
      charts: {
        days: arabicDays,
        newUsers: newUsersChartData,
        weeklyBookings: weeklyBookingsChartData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with search & role filter
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    const query = {};

    if (role && role !== 'all' && role !== 'الكل') {
      query.role = role;
    }

    if (status && status !== 'all' && status !== 'الكل') {
      query.status = status;
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    return successResponse(res, 200, 'تم جلب قائمة المستخدمين', users);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status (active / suspended)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, 404, 'المستخدم غير موجود');
    }

    if (status) user.status = status;
    if (role) user.role = role;
    await user.save();

    return successResponse(res, 200, 'تم تحديث حالة المستخدم بنجاح', user);
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending pharmacy approvals
// @route   GET /api/admin/pharmacies/pending
// @access  Private (Admin)
const getPendingPharmacies = async (req, res, next) => {
  try {
    const pharmacies = await Pharmacy.find({ isApproved: false })
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'تم جلب الصيدليات قيد المراجعة', pharmacies);
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or toggle pharmacy status
// @route   PUT /api/admin/pharmacies/:id/approve
// @access  Private (Admin)
const approvePharmacy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isApproved = true } = req.body;

    const pharmacy = await Pharmacy.findById(id);
    if (!pharmacy) {
      return errorResponse(res, 404, 'الصيدلية غير موجودة');
    }

    pharmacy.isApproved = isApproved;
    await pharmacy.save();

    return successResponse(
      res,
      200,
      isApproved ? 'تم اعتماد الصيدلية وتفعيلها بنجاح' : 'تم تعطيل الصيدلية',
      pharmacy
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get comprehensive reports & metrics
// @route   GET /api/admin/reports
// @access  Private (Admin)
const getReports = async (req, res, next) => {
  try {
    const recentOrders = await Order.find()
      .populate('patientId', 'name email')
      .populate('pharmacyId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    const popularMedicines = await Medicine.find().sort({ createdAt: -1 }).limit(5);

    const topPharmacies = await Pharmacy.find({ isApproved: true }).sort({ rating: -1 }).limit(5);

    return successResponse(res, 200, 'تم جلب التقارير', {
      recentOrders,
      popularMedicines,
      topPharmacies,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getPendingPharmacies,
  approvePharmacy,
  getReports,
};
