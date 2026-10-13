const Order = require('../models/Order');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const PharmacyInventory = require('../models/PharmacyInventory');
const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Create a new medication order
// @route   POST /api/orders
// @access  Private (Patient)
const createOrder = async (req, res, next) => {
  try {
    const {
      items,
      pharmacyId,
      deliveryFee,
      paymentMethod = 'cash',
      shippingAddress,
      prescriptionImage,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse(res, 400, 'السلة فارغة، يرجى إضافة أدوية للطلب');
    }

    const itemPharmacyIds = [...new Set(items.map((item) => item.pharmacyId).filter(Boolean).map(String))];
    if (itemPharmacyIds.length > 1 || (pharmacyId && itemPharmacyIds.some((id) => id !== String(pharmacyId)))) {
      return errorResponse(res, 400, 'يجب أن تكون جميع منتجات الطلب من صيدلية واحدة');
    }
    const targetPharmacyId = pharmacyId || itemPharmacyIds[0];
    if (!targetPharmacyId || items.some((item) => !item.pharmacyId && !pharmacyId)) {
      return errorResponse(res, 400, 'يرجى اختيار صيدلية مسجل لديها كل منتج قبل تأكيد الطلب');
    }
    const pharmacyDoc = await Pharmacy.findOne({ _id: targetPharmacyId, isApproved: true });
    if (!pharmacyDoc) {
      return errorResponse(res, 404, 'الصيدلية المختارة غير موجودة أو غير معتمدة');
    }

    const resolvedDeliveryFee =
      deliveryFee !== undefined
        ? Number(deliveryFee)
        : (pharmacyDoc?.deliveryFee !== undefined ? pharmacyDoc.deliveryFee : 15);

    // SECURITY: Server-side price & item verification against DB (Prevent client price tampering)
    const verifiedItems = [];
    const reservedStock = [];
    const restoreReservedStock = async () => {
      for (const reservation of reservedStock) {
        const restored = await PharmacyInventory.updateOne(
          { _id: reservation.inventoryId },
          { $inc: { quantity: reservation.quantity } }
        );
        if (restored.modifiedCount !== 1) {
          console.error(`Failed to restore stock for inventory ${reservation.inventoryId}`);
        }
      }
      reservedStock.length = 0;
    };
    const stockToReserve = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const qty = Math.max(1, Number(item.quantity) || 1);
      let realPrice;
      let resolvedMedicineId = item.medicineId;
      let medicineName = item.name;

      if (resolvedMedicineId) {
        const medDoc = await Medicine.findById(resolvedMedicineId);
        if (!medDoc) {
          await restoreReservedStock();
          return errorResponse(res, 404, `المنتج ${medicineName || ''} غير موجود`);
        }
        realPrice = medDoc.price;
        medicineName = medDoc.nameAr || medDoc.nameEn || medicineName;
      } else if (medicineName) {
        const medDoc = await Medicine.findOne({
          $or: [{ nameAr: medicineName }, { nameEn: medicineName }],
        });
        if (!medDoc) {
          await restoreReservedStock();
          return errorResponse(res, 404, `المنتج ${medicineName} غير موجود`);
        }
        realPrice = medDoc.price;
        resolvedMedicineId = medDoc._id;
      }

      if (!resolvedMedicineId) {
        await restoreReservedStock();
        return errorResponse(res, 400, 'تعذر تحديد المنتج المطلوب');
      }

      const inventory = await PharmacyInventory.findOne(
        {
          pharmacyId: targetPharmacyId,
          medicineId: resolvedMedicineId,
          quantity: { $gte: qty },
          isAvailable: true,
        }
      );
      if (!inventory) {
        return errorResponse(res, 409, `الكمية المطلوبة من ${medicineName || 'المنتج'} غير متوفرة في الصيدلية المختارة`);
      }
      if (inventory.customPrice !== undefined && inventory.customPrice > 0) {
        realPrice = inventory.customPrice;
      }
      if (realPrice === undefined) {
        return errorResponse(res, 400, `تعذر تحديد سعر ${medicineName || 'المنتج'}`);
      }

      stockToReserve.push({ inventoryId: inventory._id, quantity: qty, name: medicineName });
      calculatedSubtotal += realPrice * qty;
      verifiedItems.push({
        medicineId: resolvedMedicineId,
        name: medicineName || 'منتج',
        price: realPrice,
        quantity: qty,
        image: item.image || '',
      });
    }

    try {
      for (const reservation of stockToReserve) {
        const result = await PharmacyInventory.updateOne(
          {
            _id: reservation.inventoryId,
            quantity: { $gte: reservation.quantity },
            isAvailable: true,
          },
          { $inc: { quantity: -reservation.quantity } }
        );
        if (result.modifiedCount !== 1) {
          await restoreReservedStock();
          return errorResponse(res, 409, `الكمية المطلوبة من ${reservation.name || 'المنتج'} لم تعد متوفرة`);
        }
        reservedStock.push(reservation);
      }
    } catch (error) {
      await restoreReservedStock();
      throw error;
    }

    let order;
    try {
      order = await Order.create({
        patientId: req.user._id,
        pharmacyId: targetPharmacyId,
        items: verifiedItems,
        subtotal: Number(calculatedSubtotal.toFixed(2)),
        deliveryFee: Number(resolvedDeliveryFee),
        totalAmount: Number((calculatedSubtotal + Number(resolvedDeliveryFee)).toFixed(2)),
        paymentMethod,
        shippingAddress: shippingAddress || {
          fullName: req.user.name,
          phone: req.user.phone,
          governorate: req.user.address?.governorate || 'القاهرة',
          city: req.user.address?.city || 'مدينة نصر',
        },
        prescriptionImage: prescriptionImage || '',
        status: 'pending',
      });
    } catch (error) {
      await restoreReservedStock();
      throw error;
    }

    // Notify patient
    await Notification.create({
      recipientId: req.user._id,
      title: 'تم استلام طلبك بنجاح',
      message: `تم إنشاء طلبك رقم (${order.orderNumber}) بقيمة ${order.totalAmount} ج.م وهو قيد المراجعة`,
      type: 'order',
      link: `/frontend/pages/public/order-summary.html?orderId=${order._id}`,
    });

    return successResponse(res, 201, 'تم إنشاء الطلب بنجاح', order);
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in patient's orders
// @route   GET /api/orders/my-orders
// @access  Private (Patient)
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ patientId: req.user._id })
      .populate('pharmacyId', 'name phone address')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'تم جلب طلباتك', orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders for pharmacist's pharmacy
// @route   GET /api/orders/pharmacy
// @access  Private (Pharmacist)
const getPharmacyOrders = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findOne({ ownerId: req.user._id });
    if (!pharmacy && req.user.role !== 'admin') {
      return errorResponse(res, 404, 'لا توجد صيدلية مسجلة لهذا الحساب');
    }

    let query = {};
    if (pharmacy) {
      query = { $or: [{ pharmacyId: pharmacy._id }, { pharmacyId: null }] };
    }

    const { status } = req.query;
    if (status && status !== 'all' && status !== 'الكل') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('patientId', 'name email phone avatar')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'تم جلب طلبات الصيدلية', orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID with IDOR protection
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let order;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id)
        .populate('patientId', 'name email phone')
        .populate('pharmacyId', 'name phone address');
    } else {
      order = await Order.findOne({ orderNumber: id })
        .populate('patientId', 'name email phone')
        .populate('pharmacyId', 'name phone address');
    }

    if (!order) {
      return errorResponse(res, 404, 'الطلب غير موجود');
    }

    // SECURITY: IDOR Protection - Only owner patient, assigned pharmacy, or admin can view order
    const isPatientOwner =
      order.patientId && String(order.patientId._id || order.patientId) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';
    let isPharmacyOwner = false;

    if (req.user.role === 'pharmacist' && order.pharmacyId) {
      const userPharmacy = await Pharmacy.findOne({ ownerId: req.user._id });
      if (
        userPharmacy &&
        String(userPharmacy._id) === String(order.pharmacyId._id || order.pharmacyId)
      ) {
        isPharmacyOwner = true;
      }
    }

    if (!isPatientOwner && !isAdmin && !isPharmacyOwner) {
      return errorResponse(res, 403, 'غير مصرح لك بالاطلاع على تفاصيل هذا الطلب');
    }

    return successResponse(res, 200, 'تم جلب تفاصيل الطلب', order);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Pharmacist/Admin)
// @route   PUT /api/orders/:id/status
// @access  Private (Pharmacist / Admin)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'preparing', 'ready', 'delivering', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, 400, 'حالة الطلب غير صالحة');
    }

    const order = await Order.findById(id);
    if (!order) {
      return errorResponse(res, 404, 'الطلب غير موجود');
    }

    // Verify pharmacist owns this pharmacy's order
    if (req.user.role === 'pharmacist') {
      const userPharmacy = await Pharmacy.findOne({ ownerId: req.user._id });
      if (
        !userPharmacy ||
        (order.pharmacyId && String(order.pharmacyId) !== String(userPharmacy._id))
      ) {
        return errorResponse(res, 403, 'غير مصرح لك بتعديل طلبات صيدلية أخرى');
      }
    }

    const previousStatus = order.status;
    order.status = status;
    if (status === 'completed') {
      order.paymentStatus = 'paid';
    }

    // Restore stock if cancelled
    if (status === 'cancelled' && previousStatus !== 'cancelled' && order.pharmacyId) {
      for (const item of order.items) {
        if (item.medicineId) {
          await PharmacyInventory.findOneAndUpdate(
            { pharmacyId: order.pharmacyId, medicineId: item.medicineId },
            { $inc: { quantity: item.quantity } }
          );
        }
      }
    }

    await order.save();

    // Send notification to patient
    const statusArabic = {
      ready: 'جاهز للاستلام',
      preparing: 'جاري التحضير',
      delivering: 'في الطريق إليك',
      completed: 'مكتمل وتم الاستلام',
      cancelled: 'ملغي',
    };

    await Notification.create({
      recipientId: order.patientId,
      title: 'تحديث حالة الطلب',
      message: `طلبك رقم (${order.orderNumber}) أصبح الآن: ${statusArabic[status] || status}`,
      type: 'order',
      link: `/frontend/pages/public/order-summary.html?orderId=${order._id}`,
    });

    return successResponse(res, 200, 'تم تحديث حالة الطلب بنجاح', order);
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel an order by patient
// @route   PUT /api/orders/:id/cancel
// @access  Private (Patient)
const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, patientId: req.user._id });

    if (!order) {
      return errorResponse(res, 404, 'الطلب غير موجود');
    }

    if (order.status === 'completed' || order.status === 'delivering') {
      return errorResponse(res, 400, 'لا يمكن إلغاء الطلب بعد تجهيزه أو خروجه للتوصيل');
    }

    const previousStatus = order.status;
    order.status = 'cancelled';
    await order.save();

    // Restore inventory if previously reserved
    if (previousStatus !== 'cancelled' && order.pharmacyId) {
      for (const item of order.items) {
        if (item.medicineId) {
          await PharmacyInventory.findOneAndUpdate(
            { pharmacyId: order.pharmacyId, medicineId: item.medicineId },
            { $inc: { quantity: item.quantity } }
          );
        }
      }
    }

    return successResponse(res, 200, 'تم إلغاء الطلب بنجاح', order);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getPharmacyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};
