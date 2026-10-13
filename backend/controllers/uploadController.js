const { successResponse, errorResponse } = require('../utils/apiResponse');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

// @desc    Upload an image or document (Prescription, License, Medicine Image)
// @route   POST /api/upload
// @access  Private
const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, 'يرجى اختيار ملف لرفعه');
    }

    const extensionByMimeType = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
      'application/pdf': '.pdf',
    };
    const extension = extensionByMimeType[req.file.mimetype];
    if (!extension) {
      return errorResponse(res, 400, 'نوع الملف غير مدعوم');
    }

    const filename = `${crypto.randomBytes(16).toString('hex')}${extension}`;
    const uploadsDirectory = path.join(__dirname, '../uploads');
    await fs.mkdir(uploadsDirectory, { recursive: true });
    await fs.writeFile(path.join(uploadsDirectory, filename), req.file.buffer, { flag: 'wx' });

    return successResponse(res, 200, 'تم رفع الملف بنجاح', {
      url: `/uploads/${filename}`,
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadFile,
};
