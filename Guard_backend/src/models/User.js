const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    sparse: true,
    unique: true,
  },
  phone: {
    type: String,
    trim: true,
    sparse: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },

  role: {
    type: String,
    enum: ['guard', 'agency_admin', 'operations_manager', 'supervisor', 'client'],
    required: true,
  },
  avatarUrl: {
    type: String,
    default: "",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  agency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Agency",
  },
  otp: {
    type: String,
    select: false,
  },
  otpExpiry: {
    type: Date,
    select: false,
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  fcmToken: {
    type: String,
    default: null
  },
}, { timestamps: true });

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next;
});

userSchema.methods.comparePassword = async function comparePassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpiry;
  return obj;
};

module.exports = mongoose.model("User", userSchema);

