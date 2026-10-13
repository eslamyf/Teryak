/**
 * Teryak Platform - Automated Security, Financial Integrity & Regression Test Suite
 */
const http = require('http');
const path = require('path');
const fs = require('fs/promises');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const connectDB = require('../config/db');
const app = require('../app');
const User = require('../models/User');
const Order = require('../models/Order');
const Medicine = require('../models/Medicine');
const Pharmacy = require('../models/Pharmacy');
const PharmacyInventory = require('../models/PharmacyInventory');
const Notification = require('../models/Notification');

const TEST_PORT = 5095;
let server;

function apiRequest(method, endpoint, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path: endpoint,
        method,
        headers,
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          let data;
          try {
            data = JSON.parse(raw);
          } catch (e) {
            data = raw;
          }
          resolve({ status: res.statusCode, headers: res.headers, data });
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTestSuite() {
  console.log('=====================================================');
  console.log('   Teryak Platform - Production Verification Tests    ');
  console.log('=====================================================\n');

  await connectDB();
  server = app.listen(TEST_PORT);

  const testEmailPrefix = `test_${Date.now()}`;
  let passed = 0;
  let failed = 0;
  let testPharmacyId;
  let testMedicineId;
  let patientAId;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ✓ ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ✗ ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check & Security Headers
    const health = await apiRequest('GET', '/api/health');
    assert(health.status === 200 && health.data.database === 'connected', 'Health check is operational and DB is connected');
    assert(!health.headers['x-powered-by'], 'Express fingerprint (x-powered-by) is hidden');
    assert(health.headers['x-content-type-options'] === 'nosniff', 'X-Content-Type-Options: nosniff header is active');

    // 2. Weak password rejection
    const weakRes = await apiRequest('POST', '/api/auth/register', {
      email: `${testEmailPrefix}_weak@test.com`,
      password: '123',
      name: 'Weak Pwd',
      phone: '01011112222',
    });
    assert(weakRes.status === 400, 'Weak password (< 6 chars) is strictly rejected with 400 Bad Request');

    // 3. Admin Escalation Prevention
    const adminEscalate = await apiRequest('POST', '/api/auth/register', {
      email: `${testEmailPrefix}_hacker@test.com`,
      password: 'StrongPassword123!',
      name: 'Fake Admin',
      phone: '01011112222',
      role: 'admin',
    });
    assert(adminEscalate.status === 400 || adminEscalate.status === 403, 'Self-registration as admin is blocked');

    // 4. Safe Regex & ReDoS check
    const regexRes = await apiRequest('GET', '/api/medicines?search=' + encodeURIComponent('panadol('));
    assert(regexRes.status === 200, 'Special characters like "(" in search do not crash server and return 200');

    // 5. Patient Registration & Authentication
    const patientA = await apiRequest('POST', '/api/auth/register', {
      email: `${testEmailPrefix}_ptA@test.com`,
      password: 'Password123!',
      name: 'Patient A',
      phone: '01011112222',
      role: 'patient',
    });
    const tokenA = patientA.data?.data?.token;
    assert(patientA.status === 201 && !!tokenA, 'Patient A registered and received JWT token');

    // 6. Price Tampering Prevention in Order Creation
    const patientAUser = await User.findOne({ email: `${testEmailPrefix}_ptA@test.com` });
    patientAId = patientAUser?._id;
    const pharmacist = await User.create({
      email: `${testEmailPrefix}_pharmacist@test.com`,
      password: 'Password123!',
      name: 'Test Pharmacist',
      phone: '01022223333',
      role: 'pharmacist',
    });
    const medicine = await Medicine.create({
      nameAr: `منتج اختبار ${testEmailPrefix}`,
      nameEn: `Test product ${testEmailPrefix}`,
      activeIngredient: '',
      productType: 'product',
      category: 'عناية شخصية',
      price: 45,
      status: 'active',
    });
    testMedicineId = medicine._id;
    const pharmacy = await Pharmacy.create({
      ownerId: pharmacist._id,
      name: 'Test Pharmacy',
      licenseNumber: `TEST-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      phone: '01022223333',
      isApproved: true,
      deliveryFee: 0,
    });
    testPharmacyId = pharmacy._id;
    await PharmacyInventory.create({
      pharmacyId: pharmacy._id,
      medicineId: medicine._id,
      quantity: 5,
      customPrice: 50,
      isAvailable: true,
    });

    const tamperedOrder = await apiRequest('POST', '/api/orders', {
      pharmacyId: String(pharmacy._id),
      items: [{
        medicineId: String(medicine._id),
        pharmacyId: String(pharmacy._id),
        name: medicine.nameAr,
        price: 0.05,
        quantity: 2,
      }],
      subtotal: 0.1,
      totalAmount: 0.1,
      deliveryFee: 0,
    }, tokenA);

    assert(tamperedOrder.status === 201, 'Order created successfully');
    const orderTotal = tamperedOrder.data?.data?.totalAmount;
    assert(orderTotal > 1, `Server securely recalculated order price against database (Calculated: ${orderTotal} EGP vs Tampered: 0.1 EGP)`);
    const reservedInventory = await PharmacyInventory.findOne({
      pharmacyId: pharmacy._id,
      medicineId: medicine._id,
    });
    assert(reservedInventory?.quantity === 3, 'Order reserves requested quantity from the selected pharmacy stock');

    const orderIdA = tamperedOrder.data?.data?._id;

    // 7. IDOR Protection (Patient B cannot view Patient A's order)
    const patientB = await apiRequest('POST', '/api/auth/register', {
      email: `${testEmailPrefix}_ptB@test.com`,
      password: 'Password123!',
      name: 'Patient B',
      phone: '01033334444',
      role: 'patient',
    });
    const tokenB = patientB.data?.data?.token;

    const idorAttempt = await apiRequest('GET', `/api/orders/${orderIdA}`, null, tokenB);
    assert(idorAttempt.status === 403, 'Patient B attempting to view Patient A order is blocked with 403 Forbidden (IDOR Protected)');

    // 8. Payment Initiation Endpoint
    const payRes = await apiRequest('POST', '/api/payment/initiate', {
      orderId: orderIdA,
      paymentMethod: 'card',
    }, tokenA);
    assert(payRes.status === 200 && payRes.data?.data?.orderNumber, 'Payment initiation endpoint generates valid checkout payload');

    // 9. Upload endpoint accepts multipart/form-data file uploads
    const uploadForm = new FormData();
    uploadForm.append('file', new Blob(['hello-world'], { type: 'image/png' }), 'upload-test.png');
    const uploadRes = await fetch(`http://127.0.0.1:${TEST_PORT}/api/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: uploadForm,
    });
    const uploadJson = await uploadRes.json();
    assert(uploadRes.status === 200 && uploadJson?.data?.filename === 'upload-test.png', 'File upload endpoint accepts valid multipart upload and returns file metadata');

    // Clean up test data
    await Order.deleteMany({ patientId: patientAId });
    await Notification.deleteMany({ recipientId: patientAId, type: 'order' });
    if (testPharmacyId) {
      await PharmacyInventory.deleteMany({ pharmacyId: testPharmacyId });
      await Pharmacy.deleteOne({ _id: testPharmacyId });
    }
    if (testMedicineId) await Medicine.deleteOne({ _id: testMedicineId });
    await User.deleteMany({ email: new RegExp(testEmailPrefix) });
    const uploadedPath = uploadJson?.data?.url?.match(/^\/uploads\/([a-f0-9]{32}\.png)$/);
    if (uploadedPath) await fs.unlink(path.join(__dirname, '..', 'uploads', uploadedPath[1]));
    console.log('\n[INFO] Cleaned up temporary test artifacts from database.');

    console.log(`\n=====================================================`);
    console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`=====================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    server.close();
    process.exit(0);
  }
}

runTestSuite();