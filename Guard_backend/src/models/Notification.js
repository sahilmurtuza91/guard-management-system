const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Duty', 'Incidents', 'Requests', 'General'],
    default: 'General',
  },
  isRead: { type: Boolean, default: false },

  targetScreen: {
    type: String,
    default: null
  },
  targetParams: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
}, { timestamps: true });
    
module.exports = mongoose.model("Notification", notificationSchema);