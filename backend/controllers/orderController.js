const Order = require('../models/Order');
const Pharmacy = require('../models/Pharmacy');
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
      subtotal,
      deliveryFee = 15,
      totalAmount,
      paymentMethod = 'cash',
      shippingAddress,
      prescriptionImage,
    } = req.body;

    if (!items || items.length === 0) {
      return errorResponse(res, 400, 'السلة فارغة، يرجى إضافة أدوية للطلب');
    }

    // Default or resolve pharmacy
    let targetPharmacyId = pharmacyId;
    if (!targetPharmacyId) {
      const defaultPharmacy = await Pharmacy.findOne({ isApproved: true });
      if (defaultPharmacy) targetPharmacyId = defaultPharmacy._id;
    }

    const calculatedSubtotal =
      subtotal !== undefined
        ? Number(subtotal)
        : items.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
    const calculatedTotal =
      totalAmount !== undefined ? Number(totalAmount) : calculatedSubtotal + Number(deliveryFee);

    const order = await Order.create({
      patientId: req.user._id,
      pharmacyId: targetPharmacyId || undefined,
      items,
      subtotal: calculatedSubtotal,
      deliveryFee: Number(deliveryFee),
      totalAmount: calculatedTotal,
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
      message: `تم إنشاء طلبك رقم (${order.orderNumber}) بقيمة ${calculatedTotal} ج.م وهو قيد المراجعة`,
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
    
    // Find orders for this pharmacy or all pending orders if no specific pharmacy
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

// @desc    Get single order by ID
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

    order.status = status;
    if (status === 'completed') {
      order.paymentStatus = 'paid';
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

    order.status = 'cancelled';
    await order.save();

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
