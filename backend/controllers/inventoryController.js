const PharmacyInventory = require('../models/PharmacyInventory');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { escapeRegex } = require('../utils/regexHelper');

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
      .populate('medicineId', 'nameAr nameEn price activeIngredient productType category dosageForm image concentration')
      .sort({ updatedAt: -1 })
      .lean();

    inventory.forEach((item) => {
      if (item.medicineId?.image?.startsWith('data:')) item.medicineId.image = '';
    });

    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      inventory = inventory.filter((item) => {
        const med = item.medicineId;
        if (!med) return false;
        return (
          (med.nameAr || '').toLowerCase().includes(q) ||
          (med.nameEn || '').toLowerCase().includes(q) ||
          (med.activeIngredient || '').toLowerCase().includes(q)
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
      costPrice,
      shelfLocation,
      expiryDate,
      batchNumber,
      lowStockThreshold = 5,
      image,
      activeIngredient,
      productType = 'medicine',
      category,
      dosageForm,
      isAvailable = true,
    } = req.body;

    let targetMedicineId = medicineId;

    // If no medicineId provided, find by name or create a new medicine entry
    if (!targetMedicineId && medicineName) {
      const matchingType = productType === 'product'
        ? { productType: 'product' }
        : { $or: [{ productType: 'medicine' }, { productType: { $exists: false } }] };
      let med = await Medicine.findOne({
        $and: [
          { $or: [{ nameAr: medicineName }, { nameEn: medicineName }] },
          matchingType,
        ],
      });

      if (!med) {
        med = await Medicine.create({
          nameAr: medicineName,
          nameEn: medicineName,
          activeIngredient: activeIngredient || '',
          productType,
          category: category || (productType === 'product' ? 'منتجات صحية' : 'أدوية عامة'),
          dosageForm: dosageForm || '',
          image: image || '',
          price: customPrice !== undefined ? Number(customPrice) : 25,
          status: 'active',
        });
      } else if (image && !med.image) {
        med.image = image;
        await med.save();
      }
      targetMedicineId = med._id;
    } else if (targetMedicineId && image) {
      const med = await Medicine.findById(targetMedicineId);
      if (med && image !== med.image) {
        med.image = image;
        await med.save();
      }
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
      if (costPrice !== undefined) inventoryItem.costPrice = Number(costPrice);
      if (shelfLocation !== undefined) inventoryItem.shelfLocation = shelfLocation;
      if (expiryDate) inventoryItem.expiryDate = expiryDate;
      if (batchNumber) inventoryItem.batchNumber = batchNumber;
      if (typeof isAvailable === 'boolean') inventoryItem.isAvailable = isAvailable;
      await inventoryItem.save();
    } else {
      inventoryItem = await PharmacyInventory.create({
        pharmacyId: pharmacy._id,
        medicineId: targetMedicineId,
        quantity: Number(quantity),
        customPrice: customPrice ? Number(customPrice) : undefined,
        costPrice: costPrice ? Number(costPrice) : undefined,
        shelfLocation: shelfLocation || '',
        expiryDate: expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        batchNumber: batchNumber || 'BATCH-' + Math.floor(1000 + Math.random() * 9000),
        lowStockThreshold: Number(lowStockThreshold),
        isAvailable: Boolean(isAvailable),
      });
    }

    const populated = await PharmacyInventory.findById(inventoryItem._id).populate(
      'medicineId',
      'nameAr nameEn price activeIngredient productType category dosageForm image'
    );

    return successResponse(res, 201, 'تمت إضافة الدواء إلى المخزون بنجاح', populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update inventory item (quantity, price, expiry, shelf, cost)
// @route   PUT /api/inventory/:id
// @access  Private (Pharmacist)
const updateInventoryItem = async (req, res, next) => {
  try {
    const pharmacy = await getUserPharmacy(req.user._id);
    if (!pharmacy) {
      return errorResponse(res, 404, 'لم يتم العثور على صيدلية');
    }

    const { id } = req.params;
    const {
      quantity,
      customPrice,
      costPrice,
      shelfLocation,
      batchNumber,
      expiryDate,
      isAvailable,
      lowStockThreshold,
      image,
      nameAr,
      productType,
      category,
      activeIngredient,
      dosageForm,
    } = req.body;

    const item = await PharmacyInventory.findOne({
      _id: id,
      pharmacyId: pharmacy._id,
    });

    if (!item) {
      return errorResponse(res, 404, 'عنصر المخزون غير موجود');
    }

    if (quantity !== undefined) item.quantity = Number(quantity);
    if (customPrice !== undefined) item.customPrice = Number(customPrice);
    if (costPrice !== undefined) item.costPrice = Number(costPrice);
    if (shelfLocation !== undefined) item.shelfLocation = shelfLocation;
    if (batchNumber !== undefined) item.batchNumber = batchNumber;
    if (expiryDate) item.expiryDate = expiryDate;
    if (typeof isAvailable === 'boolean') item.isAvailable = isAvailable;
    if (lowStockThreshold !== undefined) item.lowStockThreshold = Number(lowStockThreshold);

    await item.save();

    if (item.medicineId && [nameAr, productType, category, activeIngredient, dosageForm, image].some(value => value !== undefined)) {
      const med = await Medicine.findById(item.medicineId);
      if (med) {
        if (nameAr !== undefined) {
          med.nameAr = nameAr;
        }
        if (productType !== undefined) med.productType = productType;
        if (category !== undefined) med.category = category;
        if (activeIngredient !== undefined) med.activeIngredient = activeIngredient;
        if (dosageForm !== undefined) med.dosageForm = dosageForm;
        if (image !== undefined) med.image = image;
        await med.save();
      }
    }

    const populated = await PharmacyInventory.findById(item._id).populate(
      'medicineId',
      'nameAr nameEn price activeIngredient productType category dosageForm image'
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
    }).populate('medicineId', 'nameAr nameEn price productType category');

    return successResponse(res, 200, 'تم جلب تنبيهات النواقص', lowStockItems);
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk import medicines to pharmacy inventory
// @route   POST /api/inventory/bulk-import
// @access  Private (Pharmacist, Admin)
const bulkImportInventory = async (req, res, next) => {
  try {
    const pharmacy = await getUserPharmacy(req.user._id);
    if (!pharmacy) {
      return errorResponse(res, 404, 'لم يتم العثور على صيدلية مرتبطة بهذا الحساب');
    }

    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return errorResponse(res, 400, 'يرجى إرسال قائمة أدوية صالحة للاستيراد');
    }

    let addedCount = 0;
    let updatedCount = 0;
    const errors = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      let name = (item.medicineName || item.nameAr || item.name || '').trim();
      const image = String(item.imageUrl || item.image || '').trim();
      if (!name && !item.medicineId) {
        errors.push(`الصف #${i + 1}: اسم الدواء أو معرّفه مطلوب`);
        continue;
      }
      if (image) {
        try {
          const imageUrl = new URL(encodeURI(image), 'http://localhost');
          if (!['http:', 'https:'].includes(imageUrl.protocol)) throw new Error('invalid protocol');
        } catch {
          errors.push(`الصف #${i + 1}: رابط الصورة غير صالح؛ استخدم رابط HTTP أو HTTPS`);
          continue;
        }
      }

      // Guard against binary/ZIP strings from corrupted imports
      if (name.includes('xl/') || name.includes('docProps') || name.includes('[Content_Types]') || name.includes('.xmlPK') || /[\x00-\x08\x0E-\x1F]/.test(name)) {
        errors.push(`الصف #${i + 1}: تم تخطي سطر تالف يحتوي على محتوى ثنائي غير صالح`);
        continue;
      }

      let targetMedId = item.medicineId;
      const productType = item.productType === 'product' ? 'product' : 'medicine';
      if (!targetMedId && name) {
        const matchingType = productType === 'product'
          ? { productType: 'product' }
          : { $or: [{ productType: 'medicine' }, { productType: { $exists: false } }] };
        let med = await Medicine.findOne({
          $and: [
            {
              $or: [
                { nameAr: name },
                { nameEn: new RegExp('^' + escapeRegex(name) + '$', 'i') }
              ],
            },
            matchingType,
          ],
        });
        if (!med) {
          med = await Medicine.create({
            nameAr: name,
            nameEn: item.nameEn || name,
            activeIngredient: item.activeIngredient || '',
            productType,
            category: item.category || (productType === 'product' ? 'عناية شخصية' : 'أدوية عامة'),
            dosageForm: item.dosageForm || '',
            image: image || '',
            price: Number(item.customPrice || item.price) || 25,
            status: 'active'
          });
        } else {
          if (item.category) med.category = item.category;
          if (item.activeIngredient !== undefined) med.activeIngredient = item.activeIngredient;
          if (item.dosageForm !== undefined) med.dosageForm = item.dosageForm;
          if (image) med.image = image;
          if (productType && med.productType !== productType) med.productType = productType;
          await med.save();
        }
        targetMedId = med._id;
      }

      let existing = await PharmacyInventory.findOne({
        pharmacyId: pharmacy._id,
        medicineId: targetMedId
      });

      const qty = Number(item.quantity) || 0;
      const price = item.customPrice !== undefined ? Number(item.customPrice) : (item.price ? Number(item.price) : undefined);
      const costPrice = item.costPrice !== undefined && item.costPrice !== null && !isNaN(Number(item.costPrice))
        ? Number(item.costPrice)
        : undefined;
      const shelfLocation = (item.shelfLocation || item.shelf || '').trim();
      const expiry = item.expiryDate ? new Date(item.expiryDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      const batch = item.batchNumber || 'BATCH-' + Math.floor(1000 + Math.random() * 9000);

      if (existing) {
        existing.quantity += qty;
        if (price !== undefined) existing.customPrice = price;
        if (costPrice !== undefined) existing.costPrice = costPrice;
        if (shelfLocation) existing.shelfLocation = shelfLocation;
        if (item.expiryDate) existing.expiryDate = expiry;
        if (item.batchNumber) existing.batchNumber = batch;
        existing.isAvailable = existing.quantity > 0;
        await existing.save();
        updatedCount++;
      } else {
        await PharmacyInventory.create({
          pharmacyId: pharmacy._id,
          medicineId: targetMedId,
          quantity: qty,
          customPrice: price,
          costPrice: costPrice,
          shelfLocation: shelfLocation,
          expiryDate: expiry,
          batchNumber: batch,
          lowStockThreshold: Number(item.lowStockThreshold) || 5,
          isAvailable: qty > 0,
        });
        addedCount++;
      }
    }

    return successResponse(res, 200, 'تم استيراد مخزون الأدوية بنجاح', {
      addedCount,
      updatedCount,
      totalProcessed: items.length,
      errors
    });
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
  bulkImportInventory,
};
