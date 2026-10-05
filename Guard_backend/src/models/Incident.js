const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema({
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GuardProfile',
    required: true,
  },
  agency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Agency",
    required: true,
  },
  site: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Site",
  },
  shift: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shift"
  },

  title: {
    type: String,
    required: true,
  },
  incidentType: {
    type: String,
    enum: [
      'Theft',
      'Unauthorized Entry',
      'Fire',
      'Medical Emergency',
      'Property Damage',
      'Suspicious Activity',
      'Other',
    ],
    required: true,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    default: ''
  },
  dateTime: {
    type: Date,
    default: Date.now
  },
  images: [{ type: String }],
  status: {
    type: String,
    enum: ['Reported', 'Under Review', 'Resolved', 'Rejected'],
    default: 'Reported',
  },
  comments: [
    {
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      text: String,
      createdAt: {
        type: Date,
        default: Date.now
      },
    },
  ],
  isEscalated: { type: Boolean, default: false },
},
  { timestamps: true }
);

module.exports = mongoose.model('Incident', incidentSchema);
