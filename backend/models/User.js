const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'اسم المستخدم مطلوب'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'البريد الإلكتروني مطلوب'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'يرجى إدخال بريد إلكتروني صحيح'],
    },
    password: {
      type: String,
      required: [true, 'كلمة المرور مطلوبة'],
      minlength: [3, 'كلمة المرور يجب أن لا تقل عن 3 أحرف'],
    },
    phone: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['patient', 'pharmacist', 'admin'],
      default: 'patient',
    },
    avatar: {
      type: String,
      default: '',
    },
    address: {
      governorate: { type: String, default: 'القاهرة' },
      city: { type: String, default: 'مدينة نصر' },
      street: { type: String, default: '' },
      details: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
    pharmacyName: {
      type: String,
      default: '',
    },
    licenseNumber: {
      type: String,
      default: '',
    }
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Don't return password in JSON responses
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
