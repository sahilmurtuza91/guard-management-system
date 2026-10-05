const mongoose = require("mongoose");

const guardProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  agency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Agency",
    required: true,
  },

  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  joinDate: {
    type: Date,
    default: Date.now()
  },
  address: {
    type: String,
    default: "",
  },
  emergencyContact: {
    type: String,
    default: "",
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: 'Male'
  },
  experienceYears: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Active', 'On Leave', 'Inactive', 'Suspended'],
    default: 'Active',
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  assignedSite: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Site",
    default: null,
  },
  documents: [
    {
      name: String,
      fileUrl: String,
      uploadedAt: { type: Date, default: Date.now },
      verified: { type: Boolean, default: false },
    },
  ],
  unavailableDates: [{ type: Date }],
  lastKnownLocation: {
    latitude: Number,
    longitude: Number,
    updatedAt: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model("GuardProfile", guardProfileSchema);