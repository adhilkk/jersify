const Razorpay = require("razorpay");

require("dotenv").config();

const razorPay = new Razorpay({

  key_id: process.env.RAZORPAY_IDKEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
  
});

module.exports = razorPay;