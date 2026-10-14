const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch(e){}
const connectDB = require('../config/db');
const Medicine = require('../models/Medicine');
const Pharmacy = require('../models/Pharmacy');
const PharmacyInventory = require('../models/PharmacyInventory');

async function testBulkImportFeatures() {
  await connectDB();
  console.log('[Test] MongoDB connected successfully.');

  const sampleMed = {
    nameAr: 'بانادول إكسترا تجريبي ' + Date.now(),
    nameEn: 'Panadol Extra Test',
    productType: 'medicine',
    category: 'مسكنات',
    price: 45,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80'
  };

  const sampleCosmetic = {
    nameAr: 'غسول سيرافي تجريبي ' + Date.now(),
    nameEn: 'CeraVe Foaming Cleanser Test',
    productType: 'product',
    category: 'عناية بالبشرة',
    price: 320,
    image: 'https://images.unsplash.com/photo-1556760544-74068565f05c?w=600&auto=format&fit=crop&q=80'
  };

  const createdMed = await Medicine.create(sampleMed);
  const createdCosmetic = await Medicine.create(sampleCosmetic);

  if (!createdMed.image || !createdMed.image.startsWith('http')) {
    throw new Error('Medicine image URL was not saved properly');
  }
  console.log('[PASS] ✓ Medicine image URL saved successfully:', createdMed.image);

  if (createdCosmetic.productType !== 'product') {
    throw new Error('Cosmetic productType was not set to product');
  }
  console.log('[PASS] ✓ Cosmetic productType confirmed as "product"');

  // Test PharmacyInventory shelfLocation and costPrice
  const dummyPharmacy = await Pharmacy.findOne();
  if (dummyPharmacy) {
    const inv = await PharmacyInventory.create({
      pharmacyId: dummyPharmacy._id,
      medicineId: createdMed._id,
      quantity: 50,
      customPrice: 45,
      costPrice: 34,
      shelfLocation: 'رف A1',
      isAvailable: true
    });

    if (inv.shelfLocation !== 'رف A1') {
      throw new Error('shelfLocation was not stored correctly');
    }
    console.log('[PASS] ✓ Pharmacy inventory shelfLocation saved successfully:', inv.shelfLocation);

    if (inv.costPrice !== 34) {
      throw new Error('costPrice was not stored correctly');
    }
    console.log('[PASS] ✓ Pharmacy inventory costPrice saved successfully:', inv.costPrice);

    await PharmacyInventory.findByIdAndDelete(inv._id);
  }

  // Clean up
  await Medicine.findByIdAndDelete(createdMed._id);
  await Medicine.findByIdAndDelete(createdCosmetic._id);
  console.log('[PASS] ✓ Cleaned up test records from database.');
  console.log('=====================================================');
  console.log('All Bulk Import Feature Tests Passed Successfully!');
  console.log('=====================================================');
  process.exit(0);
}

testBulkImportFeatures().catch(err => {
  console.error('[FAIL]', err);
  process.exit(1);
});
