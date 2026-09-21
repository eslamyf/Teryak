const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const generateToken = require('../utils/generateToken');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Register a new user (Patient or Pharmacist)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, pharmacyName, licenseNumber, address } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'يرجى تقديم البريد الإلكتروني وكلمة المرور');
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return errorResponse(res, 400, 'هذا البريد الإلكتروني مسجل بالفعل');
    }

    // Determine normalized role (support Arabic frontend inputs: 'مريض' -> 'patient', 'صيدلي' -> 'pharmacist')
    let normalizedRole = 'patient';
    if (role === 'صيدلي' || role === 'pharmacist') {
      normalizedRole = 'pharmacist';
    } else if (role === 'admin' || role === 'إدارة') {
      normalizedRole = 'admin';
    }

    // Create user
    const user = await User.create({
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role: normalizedRole,
      pharmacyName: pharmacyName || '',
      licenseNumber: licenseNumber || '',
      address: address || { governorate: 'القاهرة', city: 'مدينة نصر' },
    });

    // If pharmacist, also create pharmacy profile record
    let pharmacy = null;
    if (normalizedRole === 'pharmacist' && pharmacyName) {
      pharmacy = await Pharmacy.create({
        ownerId: user._id,
        name: pharmacyName,
        licenseNumber: licenseNumber || 'LIC-' + Date.now(),
        phone: phone || '01000000000',
        address: {
          governorate: address?.governorate || 'القاهرة',
          city: address?.city || 'مدينة نصر',
          street: address?.street || 'شارع رئيسي',
        },
      });
    }

    const token = generateToken(user._id, user.role);

    return successResponse(
      res,
      201,
      'تم إنشاء الحساب بنجاح',
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          pharmacyName: user.pharmacyName,
          licenseNumber: user.licenseNumber,
          pharmacyId: pharmacy?._id || null,
        },
        token,
      }
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'يرجى إدخال البريد الإلكتروني وكلمة المرور');
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return errorResponse(res, 401, 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    if (user.status === 'suspended') {
      return errorResponse(res, 403, 'تم تجميد هذا الحساب، يرجى التواصل مع الإدارة');
    }

    // Find pharmacy if pharmacist
    let pharmacy = null;
    if (user.role === 'pharmacist') {
      pharmacy = await Pharmacy.findOne({ ownerId: user._id });
    }

    const token = generateToken(user._id, user.role);

    return successResponse(
      res,
      200,
      'تم تسجيل الدخول بنجاح',
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
          pharmacyName: user.pharmacyName || pharmacy?.name || '',
          licenseNumber: user.licenseNumber || pharmacy?.licenseNumber || '',
          pharmacyId: pharmacy?._id || null,
          address: user.address,
        },
        token,
      }
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let pharmacy = null;
    if (user.role === 'pharmacist') {
      pharmacy = await Pharmacy.findOne({ ownerId: user._id });
    }

    return successResponse(res, 200, 'تم جلب بيانات المستخدم', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        address: user.address,
        pharmacyName: user.pharmacyName || pharmacy?.name || '',
        pharmacyId: pharmacy?._id || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return errorResponse(res, 404, 'المستخدم غير موجود');
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (address) {
      user.address = { ...user.address, ...address };
    }

    const updatedUser = await user.save();

    return successResponse(res, 200, 'تم تحديث البيانات بنجاح', {
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return errorResponse(res, 400, 'يرجى إدخال كلمة المرور الحالية والجديدة');
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return errorResponse(res, 400, 'كلمة المرور الحالية غير صحيحة');
    }

    user.password = newPassword;
    await user.save();

    return successResponse(res, 200, 'تم تغيير كلمة المرور بنجاح');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
};
