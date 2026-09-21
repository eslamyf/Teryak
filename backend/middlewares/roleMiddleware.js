const { errorResponse } = require('../utils/apiResponse');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'غير مصرح بالدخول');
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `غير مصرح لك بالوصول لهذا الإجراء (صلاحية ${roles.join(' أو ')} مطلوبة)`
      );
    }

    next();
  };
};

module.exports = { authorize };
