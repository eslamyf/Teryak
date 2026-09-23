# 🚀 دليل النشر والتشغيل الشامل لمنصة ترياق (Backend & Fullstack Guide)

> 💡 **تنبيه:** تم إعداد المشروع ليدعم النشر الكامل (Fullstack) بنقرة واحدة من المجلد الرئيسي للمشروع. يرجى مراجعة [دليل النشر الرئيسي](../../DEPLOYMENT_GUIDE.md) في مجلد المشروع الرئيسي.

---

## ملخص سريع لمتغيرات البيئة على Vercel:

| المتغير | القيمة |
|:---|:---|
| `MONGODB_URI` | رابط اتصال MongoDB Atlas |
| `JWT_SECRET` | `teryak_secret_jwt_key_2026_super_secure_hash_89a4b98c76ef4` |
| `JWT_EXPIRES_IN` | `7d` |
| `NODE_ENV` | `production` |

## حل مشكلة جدار الحماية (IP Whitelist):
1. افتح [MongoDB Atlas](https://cloud.mongodb.com/).
2. توجه إلى **Security** > **Network Access**.
3. أضف `0.0.0.0/0` (Allow Access from Anywhere).
