const mongoose = require('mongoose');

const user = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: Number },
  password: { type: String },
  is_blocked: {type: Boolean,default: false},
  referenceCode:{
    type:String
  },
  referedCode:{
    type:String
  }

});

module.exports = mongoose.model('User', user);