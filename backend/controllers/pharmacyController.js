const Pharmacy = require('../models/Pharmacy');
const PharmacyInventory = require('../models/PharmacyInventory');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get all approved pharmacies with filters (search, governorate, city)
// @route   GET /api/pharmacies
// @access  Public
const getPharmacies = async (req, res, next) => {
  try {
    const { search, governorate, city } = req.query;

    const query = { isApproved: true };

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { 'address.street': regex },
        { 'address.city': regex },
      ];
    }

    if (governorate && governorate !== 'الكل' && governorate !== 'all') {
      query['address.governorate'] = new RegExp(governorate.trim(), 'i');
    }

    if (city && city !== 'الكل' && city !== 'all') {
      query['address.city'] = new RegExp(city.trim(), 'i');
    }

    const pharmacies = await Pharmacy.find(query).sort({ rating: -1, createdAt: -1 });

    return successResponse(res, 200, 'تم جلب قائمة الصيدليات', pharmacies);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single pharmacy details & full inventory
// @route   GET /api/pharmacies/:id
// @access  Public
const getPharmacyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pharmacy = await Pharmacy.findById(id).populate('ownerId', 'name email phone');

    if (!pharmacy) {
      return errorResponse(res, 404, 'الصيدلية غير موجودة');
    }

    const inventory = await PharmacyInventory.find({
      pharmacyId: pharmacy._id,
      quantity: { $gt: 0 },
      isAvailable: true,
    }).populate('medicineId', 'nameAr nameEn price activeIngredient category dosageForm image');

    return successResponse(res, 200, 'تم جلب تفاصيل الصيدلية', {
      pharmacy,
      inventory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pharmacy for logged-in pharmacist
// @route   GET /api/pharmacies/my-pharmacy
// @access  Private (Pharmacist)
const getMyPharmacy = async (req, res, next) => {
  try {
    let pharmacy = await Pharmacy.findOne({ ownerId: req.user._id });

    if (!pharmacy) {
      // Auto-create if not yet created for this pharmacist
      pharmacy = await Pharmacy.create({
        ownerId: req.user._id,
        name: req.user.pharmacyName || `صيدلية د. ${req.user.name}`,
        licenseNumber: req.user.licenseNumber || 'LIC-' + Date.now(),
        phone: req.user.phone || '01000000000',
        address: req.user.address || { governorate: 'القاهرة', city: 'مدينة نصر' },
      });
    }

    return successResponse(res, 200, 'تم جلب بيانات الصيدلية', pharmacy);
  } catch (error) {
    next(error);
  }
};

// @desc    Update logged-in pharmacist's pharmacy details
// @route   PUT /api/pharmacies/my-pharmacy
// @access  Private (Pharmacist)
const updateMyPharmacy = async (req, res, next) => {
  try {
    let pharmacy = await Pharmacy.findOne({ ownerId: req.user._id });

    if (!pharmacy) {
      return errorResponse(res, 404, 'الصيدلية غير موجودة');
    }

    const {
      name,
      phone,
      whatsapp,
      address,
      openingHours,
      deliveryAvailable,
      deliveryFee,
      deliveryTimeMinutes,
    } = req.body;

    if (name) pharmacy.name = name;
    if (phone) pharmacy.phone = phone;
    if (whatsapp) pharmacy.whatsapp = whatsapp;
    if (address) pharmacy.address = { ...pharmacy.address, ...address };
    if (openingHours) pharmacy.openingHours = { ...pharmacy.openingHours, ...openingHours };
    if (typeof deliveryAvailable === 'boolean') pharmacy.deliveryAvailable = deliveryAvailable;
    if (deliveryFee !== undefined) pharmacy.deliveryFee = Number(deliveryFee);
    if (deliveryTimeMinutes !== undefined) pharmacy.deliveryTimeMinutes = Number(deliveryTimeMinutes);

    const updated = await pharmacy.save();

    return successResponse(res, 200, 'تم تحديث بيانات الصيدلية بنجاح', updated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPharmacies,
  getPharmacyById,
  getMyPharmacy,
  updateMyPharmacy,
};
