const mongoose = require("mongoose");

const siteSchema = new mongoose.Schema({
  agency:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Agency",
    required:true,
  },
  client:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"ClientProfile",
  },

  name:{
    type:String,
    required:true
  },
  address:{
    type:String,
    required:true,
  },
  latitude:{
    type:Number,
    required:true,
  },
  longitude:{
    type:Number,
    required:true,
  },
  geofenceRadiusMeters:{
    type:Number,
    default: 200
  },
  contactPerson:{
    type:String, default:'',
  },
  contactPhone:{
    type:String,
    default:'',
  },
  isActive:{
    type:Boolean,
    default:true
  },
},{timestamps:true});

module.exports = mongoose.model("Site", siteSchema);