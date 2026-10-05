const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  guard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GuardProfile",
    required: true,
  },
  shift: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shift",
    required: true,
  },
  agency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Agency",
    required: true,
  },

  date: {
    type: String,
    required: true
  },

  checkIn: {
    time: Date,
    latitude: Number,
    longitude: Number,
    address: String,
    withinGeofence: Boolean,
    distanceFromSite: Number,
  },
  checkOut: {
    time: Date,
    latitude: Number,
    longitude: Number,
    address: String,
    distanceFromSite: Number,
  },
  status: {
    type: String,
    enum: ["Present", "Late", "Absent", "Completed"],
    default: 'Present',
  },
  locationStatus: {
    type: String,
    enum: ["Inside", "Outside"],
    default: "Inside",
  },
  outiseSince: {
    type: Date,
    default: null,
  },
  checkoutType: {
    type: String,
    enum: ["MANUAL", "AUTO_GEOFENCE", "AUTO_SHIFT_END"],
    default: null,
  },
  workingSeconds: {
    type: Number,
    default: 0
  },
}, { timestamps: true });

attendanceSchema.index(
  { guard: 1, shift: 1 },
  { unique: true }
);

module.exports = mongoose.model('Attendance', attendanceSchema);
