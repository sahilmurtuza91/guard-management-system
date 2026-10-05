const mongoose = require("mongoose");

const guardRequestSchema = new mongoose.Schema({
  client: { // request made by whome
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  agency: { // request sent to which agency
    type: mongoose.Schema.Types.ObjectId,
    ref: "Agency",
  },

  serviceType: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    default: '',
  },
  shiftType: {
    type: String,
    enum: ['Single Shift', 'Multiple Shift'],
    default: 'Single Shift'
  },
  bookingType: {
    type: String,
    enum: ['Single Day',
      'Long Term / Monthly'],
    default: 'Single Day'
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  durationHours: {
    type: Number,
    default: 8
  },
  guardsCount: {
    type: Number,
    default: 1
  },
  genderPreference: {
    type: String,
    enum: ['Any', 'Male', 'Female'],
    default: 'Any'
  },
  experienceLevel: {
    type: String,
    enum: ['Any', '1-3 Years', '3+ Years'],
    default: 'Any'
  },
  specialRequirements: {
    type: String,
    default: ''
  },
  location: {
    address: {
      type: String,
      required: true,
    },
    latitude: Number,
    longitude: Number,
    site: { type: mongoose.Schema.Types.ObjectId, ref: 'Site' },
  },

  contactPerson: String,
  contactNumber: String,
  landmark: String,
  additionalInstructions: String,

  status: {
    type: String,
    enum: [
      'Draft',
      'Submitted',
      'Under Review',
      'Clarification Required',
      'Accepted',
      'Rejected',
      'Guard Assigned',
      'Confirmed',
      'Active',
      'Completed',
      'Cancelled by User',
      'Cancelled by Agency',
      'Expired',
      'Replacement Requested',
    ],
    default: 'Submitted',
  },

  statusReason: {
    type: String,
    default: ''
  },

  assignedGuards: [
    {
      guard: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GuardProfile'
      },
      shift: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shift'
      },
      assignedAt: {
        type: Date,
        default: Date.now
      },
    },
  ],

  timeline: [
    {
      status: String,
      note: String,
      changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      changedAt: {
        type: Date,
        default: Date.now
      },
    },
  ],

  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    default: "",
  },

  replacementReason: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model("GuardRequest", guardRequestSchema);