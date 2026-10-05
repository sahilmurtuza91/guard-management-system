const mongoose = require("mongoose");

const clientProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  savedAddresses: [{
    label: {
      type: String,
      default: "Home",
    },
    addressLine: String,
    landmark: String,
    latitude: Number,
    longitude: Number,
    isDefault: { type: Boolean, default: false },
  },],
  notificationPrefs: {
    pushEnabled: { type: Boolean, default: true },
    smsAlerts: { type: Boolean, default: true },
    emailUpdates: { type: Boolean, default: false },
    guardUpdates: { type: Boolean, default: true },
  },
}, { timestamps: true });

module.exports = mongoose.model('ClientProfile', clientProfileSchema);