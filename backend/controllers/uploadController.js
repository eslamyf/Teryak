const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Upload an image or document (Prescription, License, Medicine Image)
// @route   POST /api/upload
// @access  Private
const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, 'يرجى اختيار ملف لرفعه');
    }

    // If Cloudinary is configured in environment, upload to Cloudinary
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      // Cloudinary stream upload can be attached here
    }

    // Default safe fallback for serverless / local: Base64 Data URI
    const base64 = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

    return successResponse(res, 200, 'تم رفع الملف بنجاح', {
      url: dataUrl,
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
