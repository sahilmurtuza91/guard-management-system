const ApiError = require("../utils/ApiError");

const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw new ApiError(403, "Access denied");
  }

  next();
};

module.exports = allowRoles;