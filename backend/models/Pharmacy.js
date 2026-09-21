const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'اسم الصيدلية مطلوب'],
      trim: true,
    },
    licenseNumber: {
      type: String,
      required: [true, 'رقم ترخيص الصيدلية مطلوب'],
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'رقم هاتف الصيدلية مطلوب'],
      trim: true,
    },
    whatsapp: {
      type: String,
      default: '',
    },
    address: {
      governorate: { type: String, default: 'القاهرة' },
      city: { type: String, default: 'مدينة نصر' },
      street: { type: String, default: 'شارع عباس العقاد' },
      coordinates: {
        lat: { type: Number, default: 30.0444 },
        lng: { type: Number, default: 31.2357 },
      },
    },
    openingHours: {
      open: { type: String, default: '08:00 ص' },
      close: { type: String, default: '12:00 م' },
      is24Hours: { type: Boolean, default: false },
    },
    deliveryAvailable: {
      type: Boolean,
      default: true,
    },
    deliveryFee: {
      type: Number,
      default: 15,
    },
    deliveryTimeMinutes: {
      type: Number,
      default: 30,
    },
    isApproved: {
      type: Boolean,
      default: true, // For demo convenience, default true; admins can toggle
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    reviewCount: {
      type: Number,
      default: 120,
    },
    image: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Pharmacy', pharmacySchema);
