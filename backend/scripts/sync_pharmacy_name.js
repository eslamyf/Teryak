const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const mongoose = require('mongoose');
require('dotenv').config({ path: 'd:/03_Work/Projects/Teryak/backend/.env' });

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const Pharmacy = mongoose.model('Pharmacy', new mongoose.Schema({}, { strict: false }));

    const res1 = await User.updateMany(
      {
        $or: [
          { pharmacyName: /النهضة/i },
          { email: 'pharmacist@teryak.com' },
          { name: /محمد علي/i }
        ]
      },
      {
        $set: {
          pharmacyName: 'صيدليه اسلام',
          name: 'د. اسلام ياسر',
          address: { governorate: 'قنا', city: 'دشنا', street: 'دشنا - نجع عزوز' }
        }
      }
    );
    console.log('Users updated:', res1.modifiedCount);

    const res2 = await Pharmacy.updateMany(
      { name: /النهضة/i },
      {
        $set: {
          name: 'صيدليه اسلام',
          phone: '01028103634',
          address: { governorate: 'قنا', city: 'دشنا', street: 'دشنا - نجع عزوز' }
        }
      }
    );
    console.log('Pharmacies updated:', res2.modifiedCount);

    const pharms = await Pharmacy.find({});
    console.log('Current Pharmacies:');
    for (const p of pharms) {
      console.log({ id: p._id, name: p.name, phone: p.phone, address: p.address });
    }
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    process.exit(0);
  }
})();
