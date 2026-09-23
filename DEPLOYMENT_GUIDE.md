# 🚀 دليل النشر والتشغيل الشامل لمنصة ترياق (Teryak Deployment & Setup Guide)

يوضح هذا الدليل كيفية تشغيل منصة ترياق محلياً، وحل مشكلة جدار حماية قاعدة البيانات **MongoDB Atlas**، ونشر التطبيق بالكامل (Frontend + Backend Serverless) على منصة **Vercel**.

---

## 🛑 الخطوة 1: حل مشكلة الاتصال بقاعدة بيانات MongoDB Atlas (مهم جداً)

إذا ظهرت لك رسالة الخطأ التالية:
```text
[MongoDB Error] Connection failed: Could not connect to any servers in your MongoDB Atlas cluster.
One common reason is that you're trying to access the database from an IP that isn't whitelisted.
```

### 🛠️ خطوات الحل بالصور والخطوات:
1. سجل دخولك إلى حسابك في [MongoDB Atlas Dashboard](https://cloud.mongodb.com/).
2. من القائمة الجانبية اليسرى، تحت قسم **Security**، اضغط على **Network Access**.
3. اضغط على الزر الأخضر **Add IP Address**.
4. اضغط على خيار **ALLOW ACCESS FROM ANYWHERE** (سيقوم تلقائياً بملء `0.0.0.0/0`).
5. اضغط **Confirm**.
6. ⏳ انتظر دقيقة واحدة حتى تتغير الحالة إلى **Active**.

> **ملاحظة هامة:** خطوة `0.0.0.0/0` ضرورية جداً ليس فقط للتشغيل المحلي، بل لأن خوادم **Vercel** تستخدم عناوين IP سحابية متغيرة، وبدونها لن يتمكن موقعك على Vercel من جلب أو حفظ البيانات.

---

## 💻 الخطوة 2: التشغيل المحلي (Local Development)

تم إعداد المشروع ليعمل بأمر واحد من المجلد الرئيسي للمشروع:

```bash
# 1. تثبيت الحزم (إذا لم تكن مثبتة)
npm install

# 2. تعبئة قاعدة البيانات بالبيانات التجريبية (أدوية، مستخدمين، صيدليات، تبرعات)
npm run seed

# 3. تشغيل خادم التطوير
npm run dev
```

- 🌐 رابط المنصة الرئيسي (الفرونت إند): `http://localhost:5000`
- 🩺 رابط فحص صحة الـ API: `http://localhost:5000/api/health`

---

## ☁️ الخطوة 3: الرفع والنشر على Vercel (Fullstack Deployment)

تم تجهيز المشروع بملف `vercel.json` وملف `api/index.js` تلقائياً، بحيث يتم نشر المنصة بالكامل كـ Fullstack Web App:

### خطوات الرفع:
1. **ارفع المشروع إلى مستودع GitHub:**
   ```bash
   git add .
   git commit -m "feat: configure fullstack vercel deployment and mongodb optimizations"
   git push origin main
   ```

2. **سجل دخولك إلى [Vercel Dashboard](https://vercel.com/):**
   - اضغط على **Add New...** ثم **Project**.
   - اختر مستودع مشروع `Teryak` من حساب GitHub الخاص بك واضغط **Import**.

3. **إعدادات المشروع (Project Settings):**
   - **Framework Preset:** اتركه الافتراضي (`Other`).
   - **Root Directory:** اتركه الافتراضي (`./`).

4. **إضافة المتغيرات البيئية (Environment Variables):**
   في صفحة الإعداد قبل النشر (أو من Settings -> Environment Variables)، أضف المتغيرات التالية:

| اسم المتغير (Variable Name) | القيمة المقترحة (Value) | الوصف |
|:---|:---|:---|
| `MONGODB_URI` | `mongodb+srv://...` | رابط اتصال قاعدة بياناتك في MongoDB Atlas |
| `JWT_SECRET` | `teryak_secret_jwt_key_2026_super_secure_hash_89a4b98c76ef4` | مفتاح تشفير وتوثيق التوكن |
| `JWT_EXPIRES_IN` | `7d` | مدة صلاحية جلسة المستخدم |
| `NODE_ENV` | `production` | بيئة التشغيل الإنتاجية |

5. **اضغط Deploy 🚀:**
   - سيقوم Vercel ببناء الموقع ونشره في ثوانٍ.
   - ستحصل على رابط مباشر وسريع جداً محمي بشهادة SSL تلقائية مثل: `https://teryak-platform.vercel.app`.

---

## 📁 هيكلية مسارات Vercel (Architecture Overview)

- **`https://your-domain.vercel.app/`** ⬅️ يخدم الواجهة الأمامية (`frontend/index.html`).
- **`https://your-domain.vercel.app/pages/*`** ⬅️ صفحات المنصة (الأدوية، الصيدليات، لوحات التحكم).
- **`https://your-domain.vercel.app/api/*`** ⬅️ يوجه إلى دوال Serverless السحابية (`api/index.js`) المتصلة بقاعدة بيانات MongoDB Atlas.

---

## 🛡️ الصلاحيات والحسابات التجريبية الافتراضية (بعد تشغيل `npm run seed`)

- **حساب الإدارة (Admin):**
  - البريد: `admin@teryak.com`
  - كلمة المرور: `Admin@123456`
- **حساب الصيدلي (Pharmacist):**
  - البريد: `pharmacist@teryak.com`
  - كلمة المرور: `Pharma@123456`
- **حساب المريض / المستخدم (Patient):**
  - البريد: `patient@teryak.com`
  - كلمة المرور: `Patient@123456`
