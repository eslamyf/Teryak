const PharmacyInventory = require('../models/PharmacyInventory');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Helper to get pharmacy for logged-in user
const getUserPharmacy = async (userId) => {
  return await Pharmacy.findOne({ ownerId: userId });
};

// @desc    Get logged-in pharmacist's inventory
// @route   GET /api/inventory
// @access  Private (Pharmacist)
const getMyInventory = async (req, res, next) => {
  try {
    const pharmacy = await getUserPharmacy(req.user._id);
    if (!pharmacy) {
      return errorResponse(res, 404, 'لم يتم العثور على صيدلية مرتبطة بهذا الحساب');
    }

    const { search } = req.query;

    let inventory = await PharmacyInventory.find({ pharmacyId: pharmacy._id })
      .populate('medicineId', 'nameAr nameEn price activeIngredient category dosageForm image concentration')
      .sort({ updatedAt: -1 });

    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      inventory = inventory.filter((item) => {
        const med = item.medicineId;
        if (!med) return false;
        return (
          med.nameAr.toLowerCase().includes(q) ||
          med.nameEn.toLowerCase().includes(q) ||
          med.activeIngredient.toLowerCase().includes(q)
        );
      });
    }

    return successResponse(res, 200, 'تم جلب المخزون بنجاح', inventory);
  } catch (error) {
    next(error);
  }
};

// @desc    Add medicine to pharmacy inventory
// @route   POST /api/inventory
// @access  Private (Pharmacist)
const addToInventory = async (req, res, next) => {
  try {
    const pharmacy = await getUserPharmacy(req.user._id);
    if (!pharmacy) {
      return errorResponse(res, 404, 'لم يتم العثور على صيدلية مرتبطة بهذا الحساب');
    }

    const {
      medicineId,
      medicineName,
      quantity = 1,
      customPrice,
      expiryDate,
      batchNumber,
      lowStockThreshold = 5,
    } = req.body;

    let targetMedicineId = medicineId;

    // If no medicineId provided, find by name or create a new medicine entry
    if (!targetMedicineId && medicineName) {
      let med = await Medicine.findOne({
        $or: [{ nameAr: medicineName }, { nameEn: medicineName }],
      });

      if (!med) {
        med = await Medicine.create({
          nameAr: medicineName,
          nameEn: medicineName,
          activeIngredient: 'عام',
          category: 'أدوية عامة',
          price: customPrice || 25,
        });
      }
      targetMedicineId = med._id;
    }

    if (!targetMedicineId) {
      return errorResponse(res, 400, 'يرجى تحديد الدواء أو إدخال اسمه');
    }

    // Check if already in inventory
    let inventoryItem = await PharmacyInventory.findOne({
      pharmacyId: pharmacy._id,
      medicineId: targetMedicineId,
    });

    if (inventoryItem) {
      inventoryItem.quantity += Number(quantity);
      if (customPrice !== undefined) inventoryItem.customPrice = Number(customPrice);
      if (expiryDate) inventoryItem.expiryDate = expiryDate;
      if (batchNumber) inventoryItem.batchNumber = batchNumber;
      await inventoryItem.save();
    } else {
      inventoryItem = await PharmacyInventory.create({
        pharmacyId: pharmacy._id,
        medicineId: targetMedicineId,
        quantity: Number(quantity),
        customPrice: customPrice ? Number(customPrice) : undefined,
        expiryDate: expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        batchNumber: batchNumber || 'BATCH-' + Math.floor(1000 + Math.random() * 9000),
        lowStockThreshold: Number(lowStockThreshold),
      });
    }

    const populated = await PharmacyInventory.findById(inventoryItem._id).populate(
      'medicineId',
      'nameAr nameEn price activeIngredient category dosageForm image'
    );

    return successResponse(res, 201, 'تمت إضافة الدواء إلى المخزون بنجاح', populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update inventory item (quantity, price, expiry)
// @route   PUT /api/inventory/:id
// @access  Private (Pharmacist)
const updateInventoryItem = async (req, res, next) => {
  try {
    const pharmacy = await getUserPharmacy(req.user._id);
    if (!pharmacy) {
      return errorResponse(res, 404, 'لم يتم العثور على صيدلية');
    }

    const { id } = req.params;
    const { quantity, customPrice, expiryDate, isAvailable, lowStockThreshold } = req.body;

    const item = await PharmacyInventory.findOne({
      _id: id,
      pharmacyId: pharmacy._id,
    });

    if (!item) {
      return errorResponse(res, 404, 'عنصر المخزون غير موجود');
    }

    if (quantity !== undefined) item.quantity = Number(quantity);
    if (customPrice !== undefined) item.customPrice = Number(customPrice);
    if (expiryDate) item.expiryDate = expiryDate;
    if (typeof isAvailable === 'boolean') item.isAvailable = isAvailable;
    if (lowStockThreshold !== undefined) item.lowStockThreshold = Number(lowStockThreshold);

    await item.save();

    const populated = await PharmacyInventory.findById(item._id).populate(
      'medicineId',
      'nameAr nameEn price activeIngredient category dosageForm image'
    );

    return successResponse(res, 200, 'تم تحديث المخزون بنجاح', populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete item from inventory
// @route   DELETE /api/inventory/:id
// @access  Private (Pharmacist)
const deleteInventoryItem = async (req, res, next) => {
  try {
    const pharmacy = await getUserPharmacy(req.user._id);
    if (!pharmacy) {
      return errorResponse(res, 404, 'لم يتم العثور على صيدلية');
    }

    const { id } = req.params;
    const item = await PharmacyInventory.findOneAndDelete({
      _id: id,
      pharmacyId: pharmacy._id,
    });

    if (!item) {
      return errorResponse(res, 404, 'عنصر المخزون غير موجود');
    }

    return successResponse(res, 200, 'تم حذف الدواء من المخزون بنجاح');
  } catch (error) {
    next(error);
  }
};

// @desc    Get low stock items for notifications/alerts
// @route   GET /api/inventory/low-stock
// @access  Private (Pharmacist)
const getLowStockItems = async (req, res, next) => {
  try {
    const pharmacy = await getUserPharmacy(req.user._id);
    if (!pharmacy) {
      return errorResponse(res, 404, 'لم يتم العثور على صيدلية');
    }

    const lowStockItems = await PharmacyInventory.find({
      pharmacyId: pharmacy._id,
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
    }).populate('medicineId', 'nameAr nameEn price category');

    return successResponse(res, 200, 'تم جلب تنبيهات النواقص', lowStockItems);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyInventory,
  addToInventory,
  updateInventoryItem,
  deleteInventoryItem,
  getLowStockItems,
};
