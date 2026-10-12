const multer = require('multer');
const path = require('path');

const allowedExtensions = /jpeg|jpg|png|webp|gif|pdf/;
const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]);

// Configure memory storage (Vercel Serverless friendly)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname || '').toLowerCase();
  const extOk = allowedExtensions.test(extension.replace('.', ''));
  const mimeOk = allowedMimeTypes.has(file.mimetype || '');

  if (extOk || mimeOk) {
    return cb(null, true);
  }

  cb(
    new Error(
      'الملف المرفوع يجب أن يكون صورة بصيغة JPG أو PNG أو WEBP أو GIF أو ملف PDF'
    )
  );
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
});

module.exports = upload;
