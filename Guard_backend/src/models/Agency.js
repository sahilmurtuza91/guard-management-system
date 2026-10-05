const mongoose = require("mongoose");
const agencySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  logoUrl: {
    type: String,
    default: "",
  },
  address: {
    type: String,
    default: '',
  },
  contactEmail: {
    type: String,
    default: '',
  },
  contactPhone: {
    type: String,
    default: '',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
},
  { timestamps: true }
);

module.exports = mongoose.model("Agency", agencySchema);