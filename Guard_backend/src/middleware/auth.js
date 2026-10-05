const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized. Token missing, please login again');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, 'TOken invalid or expired. please login again.');
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    throw new ApiError(401, 'User not found or deactivated account.');
  }

  req.user = user;
  next();
});

module.exports = protect;