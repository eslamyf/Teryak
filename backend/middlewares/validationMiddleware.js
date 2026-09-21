const mongoose = require('mongoose');
const { errorResponse } = require('../utils/apiResponse');

// Validate MongoDB ObjectId
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (id && !mongoose.Types.ObjectId.isValid(id) && isNaN(Number(id)) && id.length !== 24) {
      // In case the frontend passes a custom string/slug (e.g. "paracetamol"), pass through to controller slug handling
      if (paramName === 'id' && isNaN(Number(id))) {
        return next();
      }
      return errorResponse(res, 400, `Invalid ${paramName} parameter format`);
    }
    next();
  };
};

// Validate Registration input
const validateRegister = (req, res, next) => {
  const { email, password, role, pharmacyName, licenseNumber } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('Invalid email address format');
    }
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else if (password.length < 3) {
    errors.push('Password must be at least 3 characters');
  }

  if (role === 'صيدلي' || role === 'pharmacist') {
    if (!pharmacyName || !pharmacyName.trim()) {
      errors.push('Pharmacy name is required for pharmacist accounts');
    }
    if (!licenseNumber || !licenseNumber.trim()) {
      errors.push('License number is required for pharmacist accounts');
    }
  }

  if (errors.length > 0) {
    return errorResponse(res, 400, errors.join('; '), errors);
  }

  next();
};

// Validate Login input
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Email is required');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return errorResponse(res, 400, errors.join('; '), errors);
  }

  next();
};

// Validate Medicine creation/update
const validateMedicine = (req, res, next) => {
  const { nameAr, price } = req.body;
  const errors = [];

  if (!nameAr || typeof nameAr !== 'string' || !nameAr.trim()) {
    errors.push('Medicine name (Arabic) is required');
  }

  if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
    errors.push('Price must be a valid positive number');
  }

  if (errors.length > 0) {
    return errorResponse(res, 400, errors.join('; '), errors);
  }

  next();
};

// Validate Order creation
const validateOrder = (req, res, next) => {
  const { items } = req.body;
  const errors = [];

  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push('Order must contain at least one item');
  } else {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.name || !item.name.trim()) {
        errors.push(`Item ${i + 1}: medicine name is required`);
      }
      if (item.price === undefined || isNaN(Number(item.price)) || Number(item.price) < 0) {
        errors.push(`Item ${i + 1}: valid price is required`);
      }
      if (item.quantity !== undefined && (isNaN(Number(item.quantity)) || Number(item.quantity) <= 0)) {
        errors.push(`Item ${i + 1}: quantity must be at least 1`);
      }
    }
  }

  if (errors.length > 0) {
    return errorResponse(res, 400, errors.join('; '), errors);
  }

  next();
};

// Validate Inventory Item
const validateInventory = (req, res, next) => {
  const { quantity, customPrice } = req.body;
  const errors = [];

  if (quantity !== undefined && (isNaN(Number(quantity)) || Number(quantity) < 0)) {
    errors.push('Quantity must be a positive integer (0 or greater)');
  }

  if (customPrice !== undefined && (isNaN(Number(customPrice)) || Number(customPrice) < 0)) {
    errors.push('Custom price must be a positive number');
  }

  if (errors.length > 0) {
    return errorResponse(res, 400, errors.join('; '), errors);
  }

  next();
};

// Validate Donation Request
const validateDonation = (req, res, next) => {
  const { medicineName, quantity, type } = req.body;
  const errors = [];

  if (!medicineName || typeof medicineName !== 'string' || !medicineName.trim()) {
    errors.push('Medicine name is required');
  }

  if (quantity !== undefined && (isNaN(Number(quantity)) || Number(quantity) <= 0)) {
    errors.push('Quantity must be at least 1');
  }

  if (type && !['donation', 'exchange'].includes(type)) {
    errors.push('Operation type must be either "donation" or "exchange"');
  }

  if (errors.length > 0) {
    return errorResponse(res, 400, errors.join('; '), errors);
  }

  next();
};

module.exports = {
  validateObjectId,
  validateRegister,
  validateLogin,
  validateMedicine,
  validateOrder,
  validateInventory,
  validateDonation,
};
