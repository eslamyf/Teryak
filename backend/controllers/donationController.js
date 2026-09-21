const Donation = require('../models/Donation');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get all public donations and exchanges
// @route   GET /api/donations
// @access  Public
const getDonations = async (req, res, next) => {
  try {
    const { type, city, search } = req.query;

    const query = { status: { $in: ['pending', 'approved'] } };

    if (type && type !== 'all' && type !== 'الكل') {
      query.type = type;
    }

    if (city && city !== 'all' && city !== 'الكل') {
      query.city = new RegExp(city.trim(), 'i');
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ medicineName: regex }, { activeIngredient: regex }];
    }

    const donations = await Donation.find(query)
      .populate('userId', 'name phone')
      .populate('pharmacyId', 'name phone address')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'تم جلب طلبات التبرع والاستبدال', donations);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's donations
// @route   GET /api/donations/my-donations
// @access  Private
const getMyDonations = async (req, res, next) => {
  try {
    const donations = await Donation.find({ userId: req.user._id })
      .populate('pharmacyId', 'name phone')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'تم جلب سجل تبرعاتك', donations);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a donation or exchange request
// @route   POST /api/donations
// @access  Private
const createDonation = async (req, res, next) => {
  try {
    const {
      type = 'donation',
      medicineName,
      activeIngredient,
      quantity = 1,
      expiryDate,
      packageCondition = 'sealed',
      exchangeForMedicine,
      donorName,
      donorPhone,
      city,
      image,
      notes,
    } = req.body;

    if (!medicineName) {
      return errorResponse(res, 400, 'اسم الدواء مطلوب');
    }

    const donation = await Donation.create({
      userId: req.user._id,
      type,
      medicineName,
      activeIngredient: activeIngredient || '',
      quantity: Number(quantity),
      expiryDate: expiryDate || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      packageCondition,
      exchangeForMedicine: exchangeForMedicine || '',
      donorName: donorName || req.user.name,
      donorPhone: donorPhone || req.user.phone,
      city: city || req.user.address?.city || 'القاهرة',
      image: image || '',
      notes: notes || '',
      status: 'pending',
    });

    return successResponse(
      res,
      201,
      `تم إرسال طلب ${type === 'exchange' ? 'الاستبدال' : 'التبرع'} بنجاح وجاري مراجعته`,
      donation
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Update donation status
// @route   PUT /api/donations/:id/status
// @access  Private (Pharmacist / Admin)
const updateDonationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const donation = await Donation.findById(id);
    if (!donation) {
      return errorResponse(res, 404, 'الطلب غير موجود');
    }

    donation.status = status;
    await donation.save();

    return successResponse(res, 200, 'تم تحديث حالة طلب التبرع', donation);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDonations,
  getMyDonations,
  createDonation,
  updateDonationStatus,
};
