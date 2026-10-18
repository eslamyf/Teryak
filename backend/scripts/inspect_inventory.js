const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);
dotenv.config({ path: 'backend/.env' });

const Medicine = require('../models/Medicine');
const Pharmacy = require('../models/Pharmacy');
const PharmacyInventory = require('../models/PharmacyInventory');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const totalMedicines = await Medicine.countDocuments();
  console.log('Total Medicines in DB:', totalMedicines);

  const activeMedicines = await Medicine.countDocuments({ status: 'active' });
  console.log('Active Medicines in DB:', activeMedicines);

  const User = require('../models/User');
  const users = await User.find({ role: 'pharmacist' }).lean();
  console.log('Pharmacist Users:');
  users.forEach(u => console.log('User:', u.name, u.email, 'ID:', u._id, 'pharmacyName:', u.pharmacyName));

  const pharmacies = await Pharmacy.find({}).lean();
  console.log('Total Pharmacies in DB:', pharmacies.length);

  for (const p of pharmacies) {
    const invCount = await PharmacyInventory.countDocuments({ pharmacyId: p._id });
    console.log(`- Pharmacy [${p.name}] (_id: ${p._id}, ownerId: ${p.ownerId}): ${invCount} inventory items`);
  }

  const allInv = await PharmacyInventory.find({}).populate('medicineId', 'nameAr').lean();
  console.log('\nTotal PharmacyInventory documents across DB:', allInv.length);

  // Group by medicine
  const medCounts = {};
  allInv.forEach(i => {
    const mId = i.medicineId ? String(i.medicineId._id) : 'null';
    medCounts[mId] = (medCounts[mId] || 0) + 1;
  });
  console.log('Unique medicines represented in inventory:', Object.keys(medCounts).length);

  await mongoose.disconnect();
}

check().catch(err => {
  console.error('Check failed:', err);
  process.exit(1);
});
