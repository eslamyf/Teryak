const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load Models
const User = require('./models/User');
const Pharmacy = require('./models/Pharmacy');
const Medicine = require('./models/Medicine');
const PharmacyInventory = require('./models/PharmacyInventory');
const Donation = require('./models/Donation');
const Order = require('./models/Order');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log('Clearing existing database collections...');

    await User.deleteMany({});
    await Pharmacy.deleteMany({});
    await Medicine.deleteMany({});
    await PharmacyInventory.deleteMany({});
    await Donation.deleteMany({});
    await Order.deleteMany({});

    console.log('Seeding demo users...');
    const users = await User.create([
      {
        name: 'أحمد محمود',
        email: 'patient@teryak.com',
        password: '123',
        phone: '01012345678',
        role: 'patient',
        address: { governorate: 'القاهرة', city: 'مدينة نصر', street: 'شارع عباس العقاد' },
      },
      {
        name: 'د. محمد علي',
        email: 'pharmacist@teryak.com',
        password: '123',
        phone: '01198765432',
        role: 'pharmacist',
        pharmacyName: 'صيدلية النهضة',
        licenseNumber: 'PHARM-88992',
        address: { governorate: 'القاهرة', city: 'مصر الجديدة', street: 'شارع النزهة' },
      },
      {
        name: 'د. سارة إبراهيم',
        email: 'sara.pharmacy@teryak.com',
        password: '123',
        phone: '01233445566',
        role: 'pharmacist',
        pharmacyName: 'صيدلية الشفاء التخصصية',
        licenseNumber: 'PHARM-77661',
        address: { governorate: 'الجيزة', city: 'الدقي', street: 'شارع مصدق' },
      },
      {
        name: 'المدير العام',
        email: 'admin@teryak.com',
        password: '123',
        phone: '01000000001',
        role: 'admin',
        address: { governorate: 'القاهرة', city: 'التجمع الخامس' },
      },
    ]);

    const patientUser = users[0];
    const pharmacistUser1 = users[1];
    const pharmacistUser2 = users[2];

    console.log('Seeding pharmacies...');
    const pharmacies = await Pharmacy.create([
      {
        ownerId: pharmacistUser1._id,
        name: 'صيدلية النهضة الحديثة',
        licenseNumber: 'PHARM-88992',
        phone: '01198765432',
        whatsapp: '01198765432',
        address: {
          governorate: 'القاهرة',
          city: 'مصر الجديدة',
          street: 'شارع النزهة - ميدان تريومف',
          coordinates: { lat: 30.089, lng: 31.328 },
        },
        openingHours: { open: '08:00 ص', close: '02:00 ص', is24Hours: false },
        deliveryAvailable: true,
        deliveryFee: 15,
        rating: 4.9,
        reviewCount: 142,
        isApproved: true,
      },
      {
        ownerId: pharmacistUser2._id,
        name: 'صيدلية الشفاء التخصصية',
        licenseNumber: 'PHARM-77661',
        phone: '01233445566',
        whatsapp: '01233445566',
        address: {
          governorate: 'الجيزة',
          city: 'الدقي',
          street: 'شارع مصدق - أمام برج الأطباء',
          coordinates: { lat: 30.038, lng: 31.212 },
        },
        openingHours: { open: '00:00', close: '23:59', is24Hours: true },
        deliveryAvailable: true,
        deliveryFee: 20,
        rating: 4.8,
        reviewCount: 98,
        isApproved: true,
      },
    ]);

    console.log('Seeding medicines catalog...');
    // Create base medicines first
    const panadol = await Medicine.create({
      nameAr: 'بانادول إكسترا',
      nameEn: 'Panadol Extra',
      activeIngredient: 'باراسيتامول + كافيين',
      category: 'مسكنات وخافض حرارة',
      dosageForm: 'أقراص',
      concentration: '500mg / 65mg',
      description: 'مسكن سريع وفعال لآلام الصداع، آلام الأسنان، آلام الظهر ونزلات البرد.',
      usageInstructions: 'قرص إلى قرصين كل 4 إلى 6 ساعات حسب الحاجة. الحد الأقصى 8 أقراص يومياً.',
      price: 35.0,
      requiresPrescription: false,
      image: 'assets/images/medicines/panadol.png',
      status: 'active',
    });

    const paramol = await Medicine.create({
      nameAr: 'بارامول 500',
      nameEn: 'Paramol 500mg',
      activeIngredient: 'باراسيتامول',
      category: 'مسكنات وخافض حرارة',
      dosageForm: 'أقراص',
      concentration: '500mg',
      description: 'بديل آمن وفعال للبانادول لخافض الحرارة وتسكين الآلام العامة.',
      price: 18.0,
      requiresPrescription: false,
      status: 'active',
    });

    const cataflam = await Medicine.create({
      nameAr: 'كاتافلام 50',
      nameEn: 'Cataflam 50mg',
      activeIngredient: 'ديكلوفيناك بوتاسيوم',
      category: 'مضادات التهاب ومسكنات',
      dosageForm: 'أقراص مغلفة',
      concentration: '50mg',
      description: 'مسكن قوي لآلام المفاصل والأسنان والالتهابات الحادة.',
      price: 45.0,
      requiresPrescription: false,
      status: 'active',
    });

    const augmentin = await Medicine.create({
      nameAr: 'أوجمنتين 1 جم',
      nameEn: 'Augmentin 1g',
      activeIngredient: 'أموكسيسيلين + كلافولانات',
      category: 'مضادات حيوية',
      dosageForm: 'أقراص',
      concentration: '1000mg',
      description: 'مضاد حيوي واسع المجال لعلاج التهابات الجهاز التنفسي والمسالك البولية.',
      usageInstructions: 'قرص كل 12 ساعة بعد الأكل لمدة 5-7 أيام.',
      price: 130.0,
      requiresPrescription: true,
      status: 'active',
    });

    const curam = await Medicine.create({
      nameAr: 'كيورام 1 جم',
      nameEn: 'Curam 1g',
      activeIngredient: 'أموكسيسيلين + كلافولانات',
      category: 'مضادات حيوية',
      dosageForm: 'أقراص',
      concentration: '1000mg',
      description: 'بديل مكافئ تماماً لأوجمنتين بنفس الفاعلية والمادة الفعالة.',
      price: 105.0,
      requiresPrescription: true,
      status: 'active',
    });

    const congestal = await Medicine.create({
      nameAr: 'كونجستال',
      nameEn: 'Congestal',
      activeIngredient: 'باراسيتامول + سودوإيفيدرين + كلورفينيرامين',
      category: 'أدوية البرد والإنفلونزا',
      dosageForm: 'أقراص',
      concentration: 'تركيبة مدمجة',
      description: 'علاج فعال لأعراض الرشح والزكام وانسداد الأنف والصداع المصاحب لنزلات البرد.',
      price: 31.0,
      requiresPrescription: false,
      status: 'active',
    });

    const omega3 = await Medicine.create({
      nameAr: 'أوميجا 3 بلس',
      nameEn: 'Omega 3 Plus',
      activeIngredient: 'زيت السمك + زيت جنين القمح',
      category: 'فيتامينات ومكملات غذائية',
      dosageForm: 'كبسولات رخوة',
      concentration: '1000mg',
      description: 'مكمل غذائي لدعم صحة القلب والشرايين والنشاط الذهني ومناعة الجسم.',
      price: 65.0,
      requiresPrescription: false,
      status: 'active',
    });

    const vitaminD = await Medicine.create({
      nameAr: 'ديفارول إس فيتامين د3',
      nameEn: 'Devarol S Vitamin D3',
      activeIngredient: 'كوليكالسيفيرول (فيتامين د)',
      category: 'فيتامينات ومكملات غذائية',
      dosageForm: 'أمبولات شرب / حقن',
      concentration: '200,000 IU',
      description: 'جرعة مركزة من فيتامين د3 لتقوية العظام وعلاج هشاشة العظام ونقص المناعة.',
      price: 25.0,
      requiresPrescription: false,
      status: 'active',
    });

    const aspirin = await Medicine.create({
      nameAr: 'أسبيرين بروتكت 100 مجم',
      nameEn: 'Aspirin Protect 100mg',
      activeIngredient: 'حمض أسيتيل ساليسيليك (Aspirin)',
      category: 'أدوية السيولة والقلب',
      dosageForm: 'أقراص مغلفة معوياً',
      concentration: '100mg',
      description: 'يستخدم للوقاية من الجلطات الدموية وحماية القلب والشرايين تحت إشراف طبي.',
      usageInstructions: 'قرص واحد يومياً بعد الوجبة الرئيسية مع كوب ماء كامل.',
      price: 28.0,
      requiresPrescription: false,
      status: 'active',
    });

    const ecosprin = await Medicine.create({
      nameAr: 'إيكوسبرين 75 مجم',
      nameEn: 'Ecosprin 75mg',
      activeIngredient: 'حمض أسيتيل ساليسيليك (Aspirin)',
      category: 'أدوية السيولة والقلب',
      dosageForm: 'أقراص مغلفة',
      concentration: '75mg',
      description: 'بديل فعال ومكافئ للأسبرين للوقاية الثانوية من أمراض القلب والأوعية الدموية.',
      price: 22.0,
      requiresPrescription: false,
      status: 'active',
    });

    const aspocid = await Medicine.create({
      nameAr: 'أسبوسيد أطفال 75 مجم',
      nameEn: 'Aspocid 75mg Chewable',
      activeIngredient: 'حمض أسيتيل ساليسيليك (Aspirin)',
      category: 'أدوية السيولة والقلب',
      dosageForm: 'أقراص للمضغ',
      concentration: '75mg',
      description: 'أقراص مضغ للسيولة والحماية القلبية سهلة الامتصاص والبلع.',
      price: 18.0,
      requiresPrescription: false,
      status: 'active',
    });

    const amoxil = await Medicine.create({
      nameAr: 'أموكسيل 500 مجم',
      nameEn: 'Amoxil 500mg (Amoxicillin)',
      activeIngredient: 'أموكسيسيلين',
      category: 'مضادات حيوية',
      dosageForm: 'كبسولات',
      concentration: '500mg',
      description: 'مضاد حيوي بكتيري واسع الطيف لعلاج الالتهابات والعدوى البكتيرية.',
      price: 45.0,
      requiresPrescription: true,
      status: 'active',
    });

    const antinal = await Medicine.create({
      nameAr: 'أنتينال 200 مجم',
      nameEn: 'Antinal 200mg',
      activeIngredient: 'نيفوروكسازيد',
      category: 'أدوية الجهاز الهضمي',
      dosageForm: 'كبسولات',
      concentration: '200mg',
      description: 'مطهر معوي قوي وفعال لعلاج حالات الإسهال الحاد والتهابات المعدة.',
      price: 32.0,
      requiresPrescription: false,
      status: 'active',
    });

    // Link alternatives
    panadol.alternatives = [paramol._id, cataflam._id];
    await panadol.save();

    augmentin.alternatives = [curam._id, amoxil._id];
    await augmentin.save();

    aspirin.alternatives = [ecosprin._id, aspocid._id];
    await aspirin.save();

    ecosprin.alternatives = [aspirin._id, aspocid._id];
    await ecosprin.save();

    console.log('Seeding pharmacy inventory...');
    await PharmacyInventory.create([
      {
        pharmacyId: pharmacies[0]._id,
        medicineId: panadol._id,
        quantity: 45,
        customPrice: 35.0,
      },
      {
        pharmacyId: pharmacies[0]._id,
        medicineId: augmentin._id,
        quantity: 12,
        customPrice: 130.0,
      },
      {
        pharmacyId: pharmacies[0]._id,
        medicineId: congestal._id,
        quantity: 30,
        customPrice: 31.0,
      },
      {
        pharmacyId: pharmacies[0]._id,
        medicineId: omega3._id,
        quantity: 18,
        customPrice: 65.0,
      },
      {
        pharmacyId: pharmacies[0]._id,
        medicineId: aspirin._id,
        quantity: 28,
        customPrice: 28.0,
      },
      {
        pharmacyId: pharmacies[0]._id,
        medicineId: ecosprin._id,
        quantity: 15,
        customPrice: 22.0,
      },
      {
        pharmacyId: pharmacies[0]._id,
        medicineId: antinal._id,
        quantity: 50,
        customPrice: 32.0,
      },
      {
        pharmacyId: pharmacies[1]._id,
        medicineId: panadol._id,
        quantity: 60,
        customPrice: 35.0,
      },
      {
        pharmacyId: pharmacies[1]._id,
        medicineId: paramol._id,
        quantity: 25,
        customPrice: 18.0,
      },
      {
        pharmacyId: pharmacies[1]._id,
        medicineId: curam._id,
        quantity: 15,
        customPrice: 105.0,
      },
      {
        pharmacyId: pharmacies[1]._id,
        medicineId: vitaminD._id,
        quantity: 40,
        customPrice: 25.0,
      },
      {
        pharmacyId: pharmacies[1]._id,
        medicineId: aspirin._id,
        quantity: 35,
        customPrice: 28.0,
      },
      {
        pharmacyId: pharmacies[1]._id,
        medicineId: amoxil._id,
        quantity: 20,
        customPrice: 45.0,
      },
    ]);

    console.log('Seeding demo donations & exchanges...');
    await Donation.create([
      {
        userId: patientUser._id,
        type: 'donation',
        medicineName: 'أوجمنتين 1 جم',
        quantity: 2,
        expiryDate: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
        packageCondition: 'sealed',
        donorName: 'أحمد محمود',
        donorPhone: '01012345678',
        city: 'القاهرة',
        notes: 'علبة جديدة تماماً مغلقة بالكرتونة لعدم الحاجة إليها بعد الشفاء.',
        status: 'approved',
      },
      {
        userId: patientUser._id,
        type: 'exchange',
        medicineName: 'كونجستال',
        exchangeForMedicine: 'بانادول إكسترا',
        quantity: 1,
        expiryDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
        packageCondition: 'sealed',
        donorName: 'أحمد محمود',
        donorPhone: '01012345678',
        city: 'القاهرة',
        notes: 'أرغب في استبدال دواء البرد بمسكن للصداع.',
        status: 'approved',
      },
    ]);

    console.log('Seeding demo orders...');
    await Order.create([
      {
        orderNumber: 'TRK-98124',
        patientId: patientUser._id,
        pharmacyId: pharmacies[0]._id,
        items: [
          {
            medicineId: panadol._id,
            name: 'بانادول إكسترا',
            price: 35.0,
            quantity: 2,
          },
          {
            medicineId: congestal._id,
            name: 'كونجستال',
            price: 31.0,
            quantity: 1,
          },
        ],
        subtotal: 101.0,
        deliveryFee: 15.0,
        totalAmount: 116.0,
        status: 'ready',
        paymentMethod: 'cash',
        shippingAddress: {
          fullName: 'أحمد محمود',
          phone: '01012345678',
          governorate: 'القاهرة',
          city: 'مدينة نصر',
          street: 'شارع عباس العقاد - عمارة 14',
        },
      },
    ]);

    console.log(`
======================================================
✅ تم تغذية قاعدة البيانات بنجاح (Database Seeded)
======================================================
حسابات تجريبية للمعاينة:
1. مريض:    patient@teryak.com     / 123
2. صيدلي:   pharmacist@teryak.com  / 123
3. إدارة:   admin@teryak.com       / 123
======================================================
    `);

    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
