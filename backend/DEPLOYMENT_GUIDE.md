# دليل التشغيل والنشر الشامل للـ Backend لمنصة ترياق (Deployment & Setup Guide)

يوضح هذا الدليل كيفية تشغيل الـ Backend محلياً ونشره على منصة **Vercel** وربطه بقاعدة بيانات **MongoDB Atlas**.

---

## 1. التشغيل المحلي (Local Development)

### الخطوات:

1. **الدخول لمجلد الـ Backend:**
   ```bash
   cd backend
   ```

2. **تثبيت الاعتماديات:**
   ```bash
   npm install
   ```

3. **تهيئة ملف المتغيرات البيئية (`.env`):**
   تأكد من وجود ملف `.env` داخل مجلد `backend/` يحتوي على:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/teryak_db
   JWT_SECRET=teryak_secret_jwt_key_2026_super_secure_hash_89a4b98c76ef4
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5000
   ```

4. **تغذية قاعدة البيانات بالبيانات التجريبية (Seeder):**
   ```bash
   npm run seed
   ```

5. **تشغيل السيرفر:**
   ```bash
   npm run dev
   ```
   - رابط السيرفر: `http://localhost:5000`
   - فحص صحة الـ API: `http://localhost:5000/api/health`

---

## 2. النشر على Vercel وربط MongoDB Atlas

### أ. إعداد قاعدة بيانات MongoDB Atlas:
1. أنشئ Cluster مجاني على [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. في تبويب **Network Access**: أضف `0.0.0.0/0` (Allow Access from Anywhere).
3. انسخ رابط الاتصال (Connection String) لاستخدامه في متغيرات Vercel.

### ب. النشر على Vercel:
1. ارفع المشروع إلى GitHub.
2. في Vercel Dashboard، اختر مجلد `backend` كـ **Root Directory** (إذا أردت نشر الباك إند كخدمة API مستقلة) أو انشر المشروع كاملاً.
3. أضف المتغيرات البيئية التالية في **Environment Variables**:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = `رابط_اتصال_اتلس_الخاص_بك`
   - `JWT_SECRET` = `سلسلة_أمان_عشوائية`
   - `JWT_EXPIRES_IN` = `7d`
4. اضغط **Deploy**.
