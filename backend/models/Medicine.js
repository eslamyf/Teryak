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
      required: [true, 'اسم الدواء بالإنجليزية مطلوب'],
      trim: true,
      index: true,
    },
    activeIngredient: {
      type: String,
      required: [true, 'المادة الفعالة مطلوبة'],
      trim: true,
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
      default: 'أقراص', // أقراص، كبسولات، شراب، حقن، فوار، مرهم
    },
    concentration: {
      type: String,
      default: '500 mg',
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

module.exports = mongoose.model('Medicine', medicineSchema);
