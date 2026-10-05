const User = require("../models/User");
const ClientProfile = require("../models/ClientProfile");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/apiResponse");
const generateToken = require("../utils/generateToken");
const { generateOtp, sendOtp } = require("../utils/otp");


// login
const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    throw new ApiError(400, "Email/phone and password is required");
  }

  // const loginId = identifier.trim();
  // const user = await User.findOne({
  //   $or: [{ email: loginId.toLowerCase() }, { email: loginId }, { phone: loginId }],
  // }).select("+password");

  const user = await User.findOne({
    $or: [{ email: identifier.trim().toLowerCase() }, { email: identifier.trim() }, { phone: identifier.trim() }],
  }).select("+password");

  // if (user) {
  //   const passwordMatched = await user.comparePassword(password);

  //   if (!passwordMatched) {
  //     throw new ApiError(
  //       401,
  //       "Invalid credentials, try again with correct credentials"
  //     );
  //   }
  // } else {
  //   throw new ApiError(
  //     401,
  //     "Invalid credentials, try again with correct credentials"
  //   );
  // }
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid credentials, try again with correct credentials");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Account deactivated, contact to admin");
  }

  const token = generateToken(user._id, user.role);

  return sendSuccess(res, 200, "Login successful", {
    token,
    user: user.toSafeObject(),
  });
});

// signup
const signup = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role = 'client' } = req.body;

  if (!name || !password || (!email && !phone)) {
    throw new ApiError(400, "Name, password, & email/phone is required");
  }

  const existingUser = await User.findOne(
    {
      $or: [{ email }, { phone }]
    }
  );
  if (existingUser) {
    throw new ApiError(400, "user already exist");
  }
  const user = await User.create({ name, email, phone, password, role });

  if (role === 'client') {
    await ClientProfile.create({ user: user._id });
  }

  const otp = generateOtp();
  user.otp = otp;
  user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes valid
  await user.save();
  await sendOtp(email || phone, otp);

  return sendSuccess(
    res,
    201,
    'signup successful. otp sent for the verification', {
    userId: user._id,
  })
});

// verification Otp
const verifyOtp = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;

  const user = await User.findById(userId).select('+otp +otpExpiry');
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (user.otp !== otp || Date.now() > user.otpExpiry) {
    throw new ApiError(400, "Invalid OTP or Expire OTP");
  }

  user.isPhoneVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  const token = generateToken(user._id, user.role);
  return sendSuccess(
    res,
    200,
    "OTP verified successfully", {
    token,
    user: user.toSafeObject(),
  }
  );
});

// forgotPassword
const forgotPassword = asyncHandler(async (req, res) => {
  const { identifier } = req.body;

  const user = await User.findOne({
    $or: [{ email: identifier?.toLowerCase() }, { phone: identifier }],
  })

  if (!user) {
    throw new ApiError(404, "user not found");
  }

  const otp = generateOtp();
  user.otp = otp;
  user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes valid
  await user.save();
  await sendOtp(identifier, otp);

  return sendSuccess(
    res,
    200,
    "OTP sent successfully for the password reset", {
    userId: user._id,
  }
  );
});


// reset password
const resetPassword = asyncHandler(async (req, res) => {
  const { userId, otp, newPassword } = req.body;

  const user = await User.findById(userId).select('+otp +otpExpiry +password');
  if (!user) throw new ApiError(404, 'User not found');

  if (user.otp !== otp || Date.now() > user.otpExpiry) {
    throw new ApiError(400, 'OTP invalid or expired OTP');
  }

  user.password = newPassword;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  return sendSuccess(res, 200, 'Password reset successfully.');
});


// get me
const getMe = asyncHandler(async (req, res) => {
  return sendSuccess(
    res,
    200,
    "Current user fetched", {
    user: req.user.toSafeObject()
  }
  );
});


// change password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(400, "incorrect password");
  }

  user.password = newPassword;
  await user.save();

  return sendSuccess(
    res,
    200,
    "Password chnaged successfully"
  );
});

module.exports = {
  login,
  signup,
  verifyOtp,
  forgotPassword,
  resetPassword,
  getMe,
  changePassword
}
