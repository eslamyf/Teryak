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

    // Resolve target pharmacy
    let targetPharmacyId = pharmacyId;
    let pharmacyDoc = null;
    if (targetPharmacyId) {
      pharmacyDoc = await Pharmacy.findById(targetPharmacyId);
    }
    if (!pharmacyDoc) {
      pharmacyDoc = await Pharmacy.findOne({ isApproved: true });
      if (pharmacyDoc) targetPharmacyId = pharmacyDoc._id;
    }

    const resolvedDeliveryFee =
      deliveryFee !== undefined
        ? Number(deliveryFee)
        : (pharmacyDoc?.deliveryFee !== undefined ? pharmacyDoc.deliveryFee : 15);

    // SECURITY: Server-side price & item verification against DB (Prevent client price tampering)
    const verifiedItems = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const qty = Math.max(1, Number(item.quantity) || 1);
      let realPrice = 25; // Safe fallback price
      let resolvedMedicineId = item.medicineId;
      let medicineName = item.name;

      if (resolvedMedicineId) {
        const medDoc = await Medicine.findById(resolvedMedicineId);
        if (medDoc) {
          realPrice = medDoc.price;
          medicineName = medDoc.nameAr || medDoc.nameEn || medicineName;
        }
      } else if (medicineName) {
        const medDoc = await Medicine.findOne({
          $or: [{ nameAr: medicineName }, { nameEn: medicineName }],
        });
        if (medDoc) {
          realPrice = medDoc.price;
          resolvedMedicineId = medDoc._id;
        }
      }

      // Check if target pharmacy has a custom inventory price
      if (targetPharmacyId && resolvedMedicineId) {
        const inv = await PharmacyInventory.findOne({
          pharmacyId: targetPharmacyId,
          medicineId: resolvedMedicineId,
        });
        if (inv && inv.customPrice !== undefined && inv.customPrice > 0) {
          realPrice = inv.customPrice;
        }
      }

      calculatedSubtotal += realPrice * qty;

      verifiedItems.push({
        medicineId: resolvedMedicineId || undefined,
        name: medicineName || 'دواء علاجي',
        price: realPrice,
        quantity: qty,
        image: item.image || '',
      });

      // Atomic stock reservation if item belongs to pharmacy inventory
      if (targetPharmacyId && resolvedMedicineId) {
        await PharmacyInventory.findOneAndUpdate(
          {
            pharmacyId: targetPharmacyId,
            medicineId: resolvedMedicineId,
            quantity: { $gte: qty },
          },
          { $inc: { quantity: -qty } }
        );
      }
    }

    const calculatedTotal = calculatedSubtotal + Number(resolvedDeliveryFee);

    const order = await Order.create({
      patientId: req.user._id,
      pharmacyId: targetPharmacyId || undefined,
      items: verifiedItems,
      subtotal: Number(calculatedSubtotal.toFixed(2)),
      deliveryFee: Number(resolvedDeliveryFee),
      totalAmount: Number(calculatedTotal.toFixed(2)),
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
