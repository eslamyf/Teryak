const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);
dotenv.config({ path: 'backend/.env' });

const Medicine = require('../models/Medicine');
const Pharmacy = require('../models/Pharmacy');
const PharmacyInventory = require('../models/PharmacyInventory');
const User = require('../models/User');

async function syncAndConsolidate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // 1. Get all active medicines
  const allMeds = await Medicine.find({ status: 'active' }).lean();
  console.log(`Total active catalog medicines: ${allMeds.length}`);

  // 2. Pharmacies
  const pharmacies = await Pharmacy.find({}).lean();
  console.log(`Found ${pharmacies.length} pharmacies`);

  // Target pharmacies for "صيدليه اسلام":
  // We want to make sure both pharmacy records (or all pharmacies) are properly populated with all medicines!
  for (const ph of pharmacies) {
    console.log(`\n--- Processing Pharmacy: ${ph.name} (_id: ${ph._id}) ---`);
    const currentInv = await PharmacyInventory.find({ pharmacyId: ph._id }).lean();
    console.log(`Current items in inventory: ${currentInv.length}`);

    const existingMedMap = new Map();
    currentInv.forEach(item => {
      existingMedMap.set(String(item.medicineId), item);
    });

    // Prepare bulk operations for all catalog medicines
    const bulkOps = [];
    for (const med of allMeds) {
      const medIdStr = String(med._id);
      if (existingMedMap.has(medIdStr)) {
        // Keep existing quantity, costPrice, shelfLocation, etc.
        continue;
      }

      // Add missing medicine with sensible default stock
      bulkOps.push({
        updateOne: {
          filter: { pharmacyId: ph._id, medicineId: med._id },
          update: {
            $setOnInsert: {
              pharmacyId: ph._id,
              medicineId: med._id,
              quantity: Math.floor(15 + Math.random() * 35), // 15 to 50 units
              customPrice: med.price || 25,
              costPrice: Math.round((med.price || 25) * 0.75),
              shelfLocation: 'رف ' + String.fromCharCode(65 + Math.floor(Math.random() * 5)) + (Math.floor(Math.random() * 4) + 1),
              expiryDate: new Date(Date.now() + (300 + Math.floor(Math.random() * 400)) * 24 * 60 * 60 * 1000),
              batchNumber: 'BATCH-' + Math.floor(1000 + Math.random() * 9000),
              isAvailable: true,
              lowStockThreshold: 5,
            }
          },
          upsert: true
        }
      });
    }

    if (bulkOps.length > 0) {
      console.log(`Executing bulkWrite upsert of ${bulkOps.length} missing medicines for pharmacy ${ph.name}...`);
      const result = await PharmacyInventory.bulkWrite(bulkOps);
      console.log(`Upserted count: ${result.upsertedCount}, Modified count: ${result.modifiedCount}`);
    } else {
      console.log(`All ${allMeds.length} medicines already present in inventory!`);
    }

    const finalCount = await PharmacyInventory.countDocuments({ pharmacyId: ph._id });
    console.log(`Final count for ${ph.name}: ${finalCount}`);
  }

  // Also verify user linkage:
  const p1 = await Pharmacy.findById('6abbce7c9f761bf393e6c279');
  const p2 = await Pharmacy.findById('6abbe34be18dba66a4a64112');
  console.log('Pharmacy 1 owner:', p1?.ownerId);
  console.log('Pharmacy 2 owner:', p2?.ownerId);

  await mongoose.disconnect();
  console.log('Done.');
}

syncAndConsolidate().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
