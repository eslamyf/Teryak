const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['donation', 'exchange'],
      required: true,
      default: 'donation',
    },
    medicineName: {
      type: String,
      required: [true, 'اسم الدواء مطلوب'],
      trim: true,
    },
    activeIngredient: {
      type: String,
      default: '',
    },
    quantity: {
      type: Number,
      required: [true, 'الكمية مطلوبة'],
      default: 1,
    },
    expiryDate: {
      type: Date,
      required: [true, 'تاريخ الصلاحية مطلوب'],
    },
    packageCondition: {
      type: String,
      enum: ['sealed', 'opened'],
      default: 'sealed',
    },
    exchangeForMedicine: {
      type: String,
      default: '', // In case of exchange
    },
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: false,
    },
    donorName: {
      type: String,
      default: '',
    },
    donorPhone: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: 'القاهرة',
    },
    image: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'completed', 'rejected'],
      default: 'pending',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Donation', donationSchema);
