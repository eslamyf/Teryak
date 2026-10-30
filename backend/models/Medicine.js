const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    nameAr: {
      type: String,
      required: [true, 'اسم الدواء بالعربية مطلوب'],
      trim: true,
      index: true,
    },
    nameEn: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    activeIngredient: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    productType: {
      type: String,
      enum: ['medicine', 'product'],
      default: 'medicine',
      index: true,
    },
    category: {
      type: String,
      required: [true, 'تصنيف الدواء مطلوب'],
      default: 'أدوية عامة',
      index: true,
    },
    dosageForm: {
      type: String,
      default: 'أقراص', // أقراص، كبسولات، شراب، حقن، فوار، مرهم، كريم
    },
    concentration: {
      type: String,
      default: '500 مجم',
    },
    description: {
      type: String,
      default: 'دواء علاجي معتمد',
    },
    usageInstructions: {
      type: String,
      default: 'حسب إرشادات الطبيب أو الصيدلي',
    },
    sideEffects: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      required: [true, 'سعر الدواء مطلوب'],
      min: [0, 'السعر لا يمكن أن يكون سالباً'],
    },
    requiresPrescription: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: '',
    },
    alternatives: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine',
      },
    ],
    status: {
      type: String,
      enum: ['active', 'pending'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast text search on Arabic/English names and active ingredient
medicineSchema.index({ nameAr: 'text', nameEn: 'text', activeIngredient: 'text' });

// Performance compound indexes for catalog browsing, sorting, and filtering
medicineSchema.index({ status: 1, createdAt: -1 });
medicineSchema.index({ status: 1, category: 1, createdAt: -1 });
medicineSchema.index({ status: 1, price: 1 });
medicineSchema.index({ status: 1, price: -1 });
medicineSchema.index({ status: 1, nameAr: 1 });

module.exports = mongoose.model('Medicine', medicineSchema);
