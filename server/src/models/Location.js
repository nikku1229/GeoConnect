const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({

  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },

  roomId:{
    type:String
  },

  latitude:Number,

  longitude:Number,

  updatedAt:{
    type:Date,
    default:Date.now
  }

});

module.exports = mongoose.model("Location",locationSchema);