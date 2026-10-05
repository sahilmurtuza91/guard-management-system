const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema({
  guard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GuardProfile",
    required: true,
  },
  agency: {
    type: mongoose.Schema.ObjectId,
    ref: "Agency",
    required: true,
  },
  site: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Site",
    required: true,
  },

  // if this request made by some user app then link it
  guardRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GuardRequest',
    default: null,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  reportingTime: {
    type: String,
    default: ''
  },
  breakTime: {
    type: String,
    default: ''
  },
  shiftType: {
    type: String,
    default: 'General Shift'
  },

  status: {
    type: String,
    enum: ['Upcoming', 'Active', 'Completed', 'Cancelled'],
    default: 'Upcoming',
  },

  supervisorName: {
    type: String,
    default: ''
  },
  supervisorPhone: {
    type: String,
    default: ''
  },

  cancelReason: {
    type: String,
    default: ''
  },

  reminderSent: {
    type: Boolean,
    default: false,
  },
  absentNotified: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });
module.exports = mongoose.model("Shift", shiftSchema);