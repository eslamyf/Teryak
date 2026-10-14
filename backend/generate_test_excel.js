const fs = require('fs');
const path = require('path');
const XLSX = require('../frontend/js/libs/xlsx.full.min.js');
const rootDir = path.resolve(__dirname, '..');

const products = [
  // ==========================================
  // 10 أدوية علاجية أساسية معتمدة (10 Essential Medicines)
  // ==========================================
  {
    nameAr: 'بانادول إكسترا أقراص مسكن وخافض حرارة',
    nameEn: 'Panadol Extra Tablets',
    productType: 'medicine',
    quantity: 65,
    customPrice: 45.00,
    costPrice: 34.00,
    expiryDate: '2027-12-31',
    shelfLocation: 'رف A1',
    category: 'مسكنات وخافض حرارة',
    activeIngredient: 'Paracetamol + Caffeine',
    dosageForm: 'أقراص',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80'
  },
  {
    nameAr: 'أوجمنتين 1 جم أقراص مضاد حيوي واسع المجال',
    nameEn: 'Augmentin 1g Tablets',
    productType: 'medicine',
    quantity: 35,
    customPrice: 110.00,
    costPrice: 85.00,
    expiryDate: '2026-11-15',
    shelfLocation: 'رف B2',
    category: 'مضادات حيوية',
    activeIngredient: 'Amoxicillin + Clavulanate',
    dosageForm: 'أقراص',
    imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80'
  },
  {
    nameAr: 'كونجستال أقراص لعلاج نزلات البرد والإنفلونزا',
    nameEn: 'Congestal Tablets',
    productType: 'medicine',
    quantity: 48,
    customPrice: 35.00,
    costPrice: 26.00,
    expiryDate: '2027-06-30',
    shelfLocation: 'رف C1',
    category: 'أدوية البرد والإنفلونزا',
    activeIngredient: 'Paracetamol + Pseudoephedrine',
    dosageForm: 'أقراص',
    imageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80'
  },
  {
    nameAr: 'أوميجا 3 بلس كبسولات جيلاتينية لدعم المناعة والقلب',
    nameEn: 'Omega 3 Plus Capsules',
    productType: 'medicine',
    quantity: 28,
    customPrice: 120.00,
    costPrice: 92.00,
    expiryDate: '2027-08-20',
    shelfLocation: 'رف A3',
    category: 'فيتامينات ومكملات',
    activeIngredient: 'Fish Oil + Wheat Germ Oil',
    dosageForm: 'كبسولات',
    imageUrl: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=600&auto=format&fit=crop&q=80'
  },
  {
    nameAr: 'ديفارول إس فيتامين د3 أمبولات 200,000 وحدة دولية',
    nameEn: 'Devarol S Vitamin D3 200,000 IU',
    productType: 'medicine',
    quantity: 40,
    customPrice: 30.00,
    costPrice: 22.50,
    expiryDate: '2027-10-15',
    shelfLocation: 'ثلاجة 1',
    category: 'فيتامينات ومكملات',
    activeIngredient: 'Cholecalciferol',
    dosageForm: 'حقن',
    imageUrl: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=600&auto=format&fit=crop&q=80'
  },
  {
    nameAr: 'كاتافلام 50 مجم أقراص مسكن ومضاد للالتهاب والروماتيزم',
    nameEn: 'Cataflam 50mg Tablets',
    productType: 'medicine',
    quantity: 50,
    customPrice: 52.00,
    costPrice: 40.00,
    expiryDate: '2027-09-15',
    shelfLocation: 'رف A1',
    category: 'مسكنات وخافض حرارة',
    activeIngredient: 'Diclofenac Potassium',
    dosageForm: 'أقراص',
    imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80'
  },
  {
    nameAr: 'ميبو مرهم لعلاج الحروق والجروح وتجديد خلايا الجلد',
    nameEn: 'Mebo Burn & Wound Ointment',
    productType: 'medicine',
    quantity: 25,
    customPrice: 68.00,
    costPrice: 52.00,
    expiryDate: '2027-10-01',
    shelfLocation: 'رف M3',
    category: 'جلدية وعناية',
    activeIngredient: 'B-Sitosterol + Sesame Oil',
    dosageForm: 'مرهم / كريم',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80'
  },
  {
    nameAr: 'أنتينال 200 مجم كبسولات مطهر معوي واسع المدى',
    nameEn: 'Antinal 200mg Capsules',
    productType: 'medicine',
    quantity: 36,
    customPrice: 30.00,
    costPrice: 22.00,
    expiryDate: '2027-04-10',
    shelfLocation: 'رف D2',
    category: 'جهاز هضمي ومعدة',
    activeIngredient: 'Nifuroxazide',
    dosageForm: 'كبسولات',
    imageUrl: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&auto=format&fit=crop&q=80'
  },
  {
    nameAr: 'بروفين 400 مجم أقراص مسكن وخافض حرارة',
    nameEn: 'Brufen 400mg Tablets',
    productType: 'medicine',
    quantity: 55,
    customPrice: 38.00,
    costPrice: 29.00,
    expiryDate: '2027-11-20',
    shelfLocation: 'رف A2',
    category: 'مسكنات وخافض حرارة',
    activeIngredient: 'Ibuprofen',
    dosageForm: 'أقراص',
    imageUrl: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=600&auto=format&fit=crop&q=80'
  },
  {
    nameAr: 'أوتريفين 0.1% بخاخ أنف للكبار لإزالة الاحتقان فوراً',
    nameEn: 'Otrivin 0.1% Adult Nasal Spray',
    productType: 'medicine',
    quantity: 22,
    customPrice: 25.00,
    costPrice: 19.00,
    expiryDate: '2026-12-30',
    shelfLocation: 'رف N1',
    category: 'حساسية وجهاز تنفسي',
    activeIngredient: 'Xylometazoline',
    dosageForm: 'بخاخ',
    imageUrl: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&auto=format&fit=crop&q=80'
  },

  // ==========================================
  // 10 مستحضرات تجميل وعناية بالبشرة والشعر (10 Cosmetics & Skincare Products)
  // ==========================================
  {
    nameAr: 'غسول سيرافي المنظف للبشرة الرغوي 236 مل',
    nameEn: 'CeraVe Foaming Facial Cleanser 236ml',
    productType: 'product',
    quantity: 20,
    customPrice: 320.00,
    costPrice: 245.00,
    expiryDate: '2028-02-28',
    shelfLocation: 'رف التجميل C1',
    category: 'عناية بالبشرة',
    activeIngredient: 'Ceramides + Niacinamide + Hyaluronic Acid',
    dosageForm: 'جل غسول',
    imageUrl: 'https://images.unsplash.com/photo-1556760544-74068565f05c?w=600&auto=format&fit=crop&q=80'
  },
  {
    nameAr: 'سيروم سيرافي بحمض الهيالورونيك للترطيب العميق 30 مل',
    nameEn: 'CeraVe Hydrating Hyaluronic Acid Serum 30ml',
    productType: 'product',
    quantity: 15,
    customPrice: 410.00,
    costPrice: 315.00,
    expiryDate: '2028-04-15',
    shelfLocation: 'رف التجميل C1',
    category: 'عناية بالبشرة',
    activeIngredient: 'Hyaluronic Acid + Vitamin B5 + Ceramides',
    dosageForm: 'سيروم',
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80'
  },
  {
    nameAr: 'لاروش بوزيه إيفاكلار جل غسول منقي للبشرة الدهنية 200 مل',
    nameEn: 'La Roche-Posay Effaclar Purifying Foaming Gel 200ml',
    productType: 'product',
    quantity: 18,
    customPrice: 380.00,
    costPrice: 295.00,
    expiryDate: '2028-01-30',
    shelfLocation: 'رف التجميل C2',
    category: 'عناية بالبشرة',
    activeIngredient: 'Zinc PCA + Thermal Spring Water',
    dosageForm: 'جل غسول',
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80'
  },
  {
    nameAr: 'واقي شمس فيشي كابيتال سوليل لمسة جافة SPF 50+ 50 مل',
    nameEn: 'Vichy Capital Soleil Mattifying Face Dry Touch SPF50+ 50ml',
    productType: 'product',
    quantity: 24,
    customPrice: 450.00,
    costPrice: 350.00,
    expiryDate: '2027-09-30',
    shelfLocation: 'رف التجميل C2',
    category: 'واقي شمس وحماية',
    activeIngredient: 'Mexoryl SX & XL + Mineralizing Water',
    dosageForm: 'كريم واقي شمس',
    imageUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&auto=format&fit=crop&q=80'
  },
  {
    nameAr: 'كريم بيبانثين بلس المرطب والملطف لترميم الجلد 30 جم',
    nameEn: 'Bepanthen Plus Healing & Antiseptic Cream 30g',
    productType: 'product',
    quantity: 32,
    customPrice: 95.00,
    costPrice: 72.00,
    expiryDate: '2027-11-15',
    shelfLocation: 'رف العناية D1',
    category: 'جلدية وعناية',
    activeIngredient: 'Dexpanthenol (Pro-Vitamin B5) + Chlorhexidine',
    dosageForm: 'كريم',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80'
  },
  {
    nameAr: 'شامبو فيشي ديركوس المضاد للقشرة المتقدم للشعر الدهني 200 مل',
    nameEn: 'Vichy Dercos Anti-Dandruff DS Shampoo 200ml',
    productType: 'product',
    quantity: 16,
    customPrice: 360.00,
    costPrice: 280.00,
    expiryDate: '2028-03-31',
    shelfLocation: 'رف العناية بالشعر H1',
    category: 'عناية بالشعر',
    activeIngredient: 'Selenium DS + Salicylic Acid',
    dosageForm: 'شامبو',
    imageUrl: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&auto=format&fit=crop&q=80'
  },
  {
    nameAr: 'ماء ميسيلار بايوديرما سينسيبيو H2O المنظف ومزيل المكياج 500 مل',
    nameEn: 'Bioderma Sensibio H2O Micellar Water 500ml',
    productType: 'product',
    quantity: 14,
    customPrice: 395.00,
    costPrice: 305.00,
    expiryDate: '2028-05-20',
    shelfLocation: 'رف التجميل C3',
    category: 'مستحضرات تجميل',
    activeIngredient: 'Micelles + Cucumis Sativus Fruit Extract',
    dosageForm: 'محلول ميسيلار',
    imageUrl: 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?w=600&auto=format&fit=crop&q=80'
  },
  {
    nameAr: 'سيروم فيتامين سي للوجه للتفتيح والنضارة ومقاومة الأكسدة 30 مل',
    nameEn: 'Vitamin C Antioxidant Radiance Face Serum 30ml',
    productType: 'product',
    quantity: 25,
    customPrice: 180.00,
    costPrice: 135.00,
    expiryDate: '2027-12-15',
    shelfLocation: 'رف التجميل C3',
    category: 'عناية بالبشرة',
    activeIngredient: 'Pure Vitamin C (Ascorbic Acid) + Hyaluronic Acid',
    dosageForm: 'سيروم',
    imageUrl: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=600&auto=format&fit=crop&q=80'
  },
  {
    nameAr: 'كريم نيفيا سوفت المرطب المنعش للوجه والجسم 200 مل',
    nameEn: 'Nivea Soft Moisturizing Cream 200ml',
    productType: 'product',
    quantity: 40,
    customPrice: 85.00,
    costPrice: 65.00,
    expiryDate: '2028-06-30',
    shelfLocation: 'رف العناية D2',
    category: 'عناية شخصية',
    activeIngredient: 'Jojoba Oil + Vitamin E',
    dosageForm: 'كريم مرطب',
    imageUrl: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=600&auto=format&fit=crop&q=80'
  },
  {
    nameAr: 'لوشن فازلين للعناية الأساسية وترطيب الجسم الجاف 400 مل',
    nameEn: 'Vaseline Intensive Care Essential Healing Lotion 400ml',
    productType: 'product',
    quantity: 22,
    customPrice: 175.00,
    costPrice: 135.00,
    expiryDate: '2028-07-31',
    shelfLocation: 'رف العناية D3',
    category: 'عناية شخصية',
    activeIngredient: 'Pure Oat Extract + Micro-droplets of Vaseline Jelly',
    dosageForm: 'لوشن مرطب',
    imageUrl: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600&auto=format&fit=crop&q=80'
  }
];

// 1. Build Excel (.xlsx)
const headers = [
  'اسم الدواء / المنتج',
  'الاسم الإنجليزي',
  'نوع المنتج',
  'الكمية',
  'سعر البيع',
  'سعر التكلفة',
  'تاريخ الصلاحية',
  'الموقع / الرف',
  'القسم / التصنيف',
  'المادة الفعالة',
  'الشكل الدوائي',
  'رابط الصورة'
];

const rows = [
  headers,
  ...products.map(p => [
    p.nameAr,
    p.nameEn,
    p.productType,
    p.quantity,
    p.customPrice,
    p.costPrice,
    p.expiryDate,
    p.shelfLocation,
    p.category,
    p.activeIngredient,
    p.dosageForm,
    p.imageUrl
  ])
];

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(rows);

// Set column widths for readability
ws['!cols'] = [
  { wch: 38 }, // اسم المنتج
  { wch: 32 }, // الاسم الإنجليزي
  { wch: 14 }, // نوع المنتج
  { wch: 10 }, // الكمية
  { wch: 12 }, // سعر البيع
  { wch: 12 }, // سعر التكلفة
  { wch: 15 }, // تاريخ الصلاحية
  { wch: 16 }, // الموقع / الرف
  { wch: 22 }, // القسم / التصنيف
  { wch: 32 }, // المادة الفعالة
  { wch: 15 }, // الشكل الدوائي
  { wch: 55 }  // رابط الصورة
];

XLSX.utils.book_append_sheet(wb, ws, 'الأدوية ومنتجات التجميل');

// 2. Build CSV
let csvContent = '\uFEFF' + headers.map(h => `"${h}"`).join(',') + '\r\n';
products.forEach(p => {
  const row = [
    `"${p.nameAr.replace(/"/g, '""')}"`,
    `"${p.nameEn.replace(/"/g, '""')}"`,
    `"${p.productType}"`,
    p.quantity,
    p.customPrice.toFixed(2),
    p.costPrice.toFixed(2),
    `"${p.expiryDate}"`,
    `"${p.shelfLocation.replace(/"/g, '""')}"`,
    `"${p.category.replace(/"/g, '""')}"`,
    `"${p.activeIngredient.replace(/"/g, '""')}"`,
    `"${p.dosageForm.replace(/"/g, '""')}"`,
    `"${p.imageUrl}"`
  ];
  csvContent += row.join(',') + '\r\n';
});

// Write to frontend/assets/ (linked by buttons)
const assetsDir = path.join(rootDir, 'frontend', 'assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

const targetXlsxAssets = path.join(assetsDir, 'teryak_20_exact_products_test.xlsx');
const targetCsvAssets = path.join(assetsDir, 'teryak_20_exact_products_test.csv');
const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
fs.writeFileSync(targetXlsxAssets, excelBuffer);
fs.writeFileSync(targetCsvAssets, csvContent, 'utf8');

// Write to root workspace so user can directly open it
const targetXlsxRoot = path.join(rootDir, 'teryak_20_exact_products_test.xlsx');
const targetCsvRoot = path.join(rootDir, 'teryak_20_exact_products_test.csv');
fs.writeFileSync(targetXlsxRoot, excelBuffer);
fs.writeFileSync(targetCsvRoot, csvContent, 'utf8');

console.log('✓ Successfully created 20-product Excel and CSV test files in:');
console.log('  1.', targetXlsxAssets);
console.log('  2.', targetCsvAssets);
console.log('  3.', targetXlsxRoot);
console.log('  4.', targetCsvRoot);
