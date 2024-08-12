const User = require("../models/userModel");
const product = require("../models/product");
const category = require("../models/categoryModel");
// const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Cart = require("../models/cart");
const Wallet = require("../models/wallet");
const bcrypt = require("bcrypt");
const flash = require("express-flash");
const crypto = require('crypto');

const mongoose = require('mongoose')

//  OTPs and user data
const otpStorage = {};
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "adhilkk8@gmail.com",
    pass: "dfwx sikz dfqe erjq",
  },
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = (email, otp) => {
  const mailOptions = {
    from: "your-email@gmail.com",
    to: email,
    subject: "OTP Verification",
    text: `Hello, Welcome to JERSIFY
    Your OTP is ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
    }
  });
};
// const registerPage = async (req,res)=>{
//   try {
//     res.render("users/register");
//   } catch (error) {
//     res.status(400).send(error.message)
//   }
// }

const loadRegister = async (req, res) => {
  try {
    const categoryData = await category.find({is_listed: true})

    const referedCode = req.query.referenceCode;

    req.session.referedCode = referedCode;

    if (referedCode) {

      console.log("referenceCode is::::::::::::::::", referedCode);

    } else {
      
      console.log("Error in getting referenceCode");

    }
    const msg = req.flash('flash')
    res.render("users/register" , {pswMsg : msg,categoryData});

  } catch (error) {

    console.log(error.message);
  }

};

const register_user = async (req, res) => {
  const {
    userFullName,
    registerEmail,
    registerPhone,
    registerPassword,
    registerCpassword,
  } = req.body;

  if (registerPassword !== registerCpassword) {
    req.flash('flash' , 'Passwords do not match')
   return res.redirect("/registerPage");
  }

  const securePassword = async (password) => {
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      return passwordHash;
    } catch (error) {
      console.log(error.message);    }
  };

  try {
    const spassword = await securePassword(registerPassword);
    const otp = generateOTP();
    const otpTimestamp = Date.now();

    const userData = await User.findOne({ email: registerEmail });
    if (userData) {
      req.flash('flash' , "Email already exists")
      return res.redirect("/registerPage");
    } else {
      otpStorage[registerEmail] = {
        fullName: userFullName,
        email: registerEmail,
        password: spassword,
        phoneNumber: registerPhone, 
        otp: otp,
        otpTimestamp: otpTimestamp,
      };

      sendOTP(registerEmail, otp);
      const categoryData = await category.find({is_listed: true})
      res.render("users/otp", categoryData,{ email: registerEmail });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const verify_otp = async (req, res) => {
  const { email, otp } = req.body;
  const randomReferenceCode = await generateRandomId();
  try {
    const tempUser = otpStorage[email];
    const referedCode = req.session.referedCode;
    
    if (referedCode ) {
      console.log("referenceCode is::::::::::::::::", referedCode);
    } else {
      console.log("Error in getting referedCode");
    }
    
    if (!tempUser) {
      return res.render("users/otp", { otpMsg: "Invalid email", email: email });
    }

    const currentTime = Date.now();
    const otpValidDuration = 60 * 1000;

    if (currentTime - tempUser.otpTimestamp > otpValidDuration) {
      return res.render("users/otp", {
        otpMsg: "OTP has expired",
        email: email,
      });
    }

    if (tempUser.otp === otp) {
      const newUser = new User({
        fullName: tempUser.fullName,
        email: tempUser.email,
        password: tempUser.password,
        phoneNumber: tempUser.phoneNumber,
        referenceCode: randomReferenceCode,
      });
      // Add referedCode if referenceCode is present
      if (referedCode) {
        
        newUser.referedCode = referedCode;
      }
      




      await newUser.save();
      delete otpStorage[email];
      res.redirect("/login");
    } else {
      res.render("users/otp", { otpMsg: "Invalid OTP", email: email });
    }
  } catch (error) {
    console.log(error.message);  }
};

const resend_otp = async (req, res) => {
  const { email } = req.body;
  try {
    const tempUser = otpStorage[email];
    if (!tempUser) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    const newOTP = generateOTP();
    const otpTimestamp = Date.now();
    tempUser.otp = newOTP;
    tempUser.otpTimestamp = otpTimestamp;

    res.json({ success: true, message: "OTP resent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to resend OTP" });
  }
};

const loadLogin = async (req, res) => {
  try {
    const categoryData = await category.find({is_listed: true})
    if (req.session.user) {
      return res.redirect("/");
    } else {
      const msg = req.flash("flash");
      return res.render("users/login", { msgg: msg ,categoryData});
    }
  } catch (error) {
console.log(error.message);  }
};

const loadShop = async (req, res) => {
  try {
    res.render("users/product");
  } catch (error) {
console.log(error.message);  }
};

const login_user = async (req, res) => {
  try {
    const { Email, password } = req.body;
    const userData = await User.findOne({ email: Email });

    if (!userData) {
      req.flash("flash", "Invalid Email");
      return res.redirect("/login");
    }

    if (userData) {
      let check = await bcrypt.compare(password, userData.password);

      if (check) {
        if (userData.is_blocked) {
          req.flash("flash", "Your account is blocked. Please contact support.");
          return res.redirect("/login");
        }
        req.session.user = userData;
       return  res.redirect("/");
      } else {
        if (!check) {
          req.flash("flash", "Invalid Password");
          return res.redirect("/login");
        }
      }
    }
  } catch (error) {
console.log(error.message);  }
};

const products = async (req, res) => {
  try {
    const login = req.session.user;
    const producDataa = await product
      .find({ status: true })
      .populate("category");
    const categoryData = await category.find({ is_listed: true });

    
    res.render("users/product", {
      producData: producDataa,
      categoryData,
      login,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const productDetails = async (req, res) => {
  try {
    const login = req.session.user;
    const id = req.query.id;
    const categoryData = await category.find({ is_listed: true });
    const productData = await product.findOne({ _id: id });
    const productRecom = await product
      .find({ category: productData.category })
      .populate("category");
    {
      res.render("users/productDetails", {
        categoryData,
        productData,
        productRecom,
        login,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadAuth = (req, res) => {
  res.render("auth");
};

const successGoogleLogin = async (req, res) => {
  if (!req.user) res.redirect("/failure");

  const newUser = new User({
    fullName: req.user.given_name,
    email: req.user.email,
  });

  const userNew = await newUser.save();

  if (!req.session.user) {
    req.session.user = {};
  }
  req.session.user._id = userNew._id;
  res.redirect("/");
};

const failureGoogleLogin = (req, res) => {
  res.send("Error");
};

const loadHome = async (req, res) => {
  try {
    const categoryData = await category.find({is_listed: true})
    if (req.session.user) {
      res.render("users/home", { login: req.session.user,categoryData });
    } else {
      res.render("users/home",{categoryData});
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadLogout = async (req, res) => {
  try {
    if (req.session.user) {
      req.session.user = undefined;
      res.redirect("/login");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const cartAction = async (req, res) => {
  try {
    if (req.session.user) {
      const userIdd = req.session.user._id;

      const cartAcction = await Cart.findOne({ userId: userIdd });

      const val = cartAcction.product.length;

      res.send({ success: val });
    } else {
      res.send({ success: 0 });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//  Price Filter

const priceFilter = async (req, res, next) => {
  try {
    const minn = req.body.min;
    const maxx = req.body.max;

    if (minn && maxx) {
      const productPrice = await product
        .find({
          $and: [
            { price: { $lt: Number(maxx) } },
            { price: { $gt: Number(minn) } },
          ],
        })
        .populate("category");

      if (productPrice) {
        res.send({ success: productPrice });
      } else {
        res.send({ fail: "failed" });
      }
    } else {
      res.send({ fail: "failed" });
    }
  } catch (error) {
    next(error, req, res);
  }
};

const filterByCategory = async (req, res, next) => {
  try {
    const { cateId, isChecked } = req.body;

    if (isChecked) {
     
      const categoryData = await category.find({ _id: cateId });

      if (categoryData.length > 0) {
        const products = await product.find({ 
          category: new mongoose.Types.ObjectId(cateId), 
          status: true 
        }).populate('category');

        res.send(products);
      } else {
        res.status(404).send({ error: "Category not found" });
      }
    } else {
      
      const products = await product.find({ status: true }).populate('category');
      res.send(products);
    }
  } catch (error) {
    next(error, req, res);
  }
};


const newArrivals = async (req, res, next) => {
  try {
    const { status, newArrival } = req.body;

    let query = {};

    if (status) {
      query.status = true;
    }

    let sortOptions = { name: 1 };

    if (newArrival) {
      sortOptions = { createdAt: -1 };
    }

    const products = await product
      .find(query)
      .sort(sortOptions)
      .populate("category");
    res.send(products);
  } catch (error) {
    next(error, req, res);
  }
};

const aAzZ = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (status) {
      const products = await product
        .find({ status: true })
        .sort({ name: 1 })
        .populate("category");

      res.send(products);
    }
  } catch (error) {
    next(error, req, res);
  }
};

const zZaA = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (status) {
      const products = await product
        .find({ status: true })
        .sort({ name: -1 })
        .populate("category");

      res.send(products);
    }
  } catch (error) {
    next(error, req, res);
  }
};

const lowToHigh = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (status) {
      const products = await product
        .find({ status: true })
        .sort({ price: 1 })
        .populate("category");

      res.send(products);
    }
  } catch (error) {
    next(error, req, res);
  }
};

const highTolow = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (status) {
      const products = await product
        .find({ status: true })
        .sort({ price: -1 })
        .populate("category");

      res.send(products);
    }
  } catch (error) {
    next(error, req, res);
  }
};



//  Search Product  :-

const searchProduct = async (req, res) => {
  try {
    const findProduct = req.body.items;

    const searchedItem = await product
      .find({ name: { $regex: new RegExp(`.*${findProduct}.*`, "i") } })
      .populate("category");

   

    res.send(searchedItem);
  } catch (error) {
    console.log(error.message);
  }
};



//  LoadWallet (Get Method) :-

const loadWallet = async (req, res) => {
    
  try {

      const categoryData = await category.find({ is_Listed: true });

      if (req.session.user) {
       

          const walletData = await Wallet.findOne({ userId: req.session.user._id });
          
          

          res.render('users/wallet', { login: req.session.user, categoryData, walletData });

      } else {

          res.redirect('/login')

      }
      
  } catch (error) {

      console.log(error.message);
      
  }

};

const generateRandomId = () => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let randomId = '';
  for (let i = 0; i < 6; i++) {
      const randomIndex = crypto.randomBytes(1)[0] % alphabet.length;
      randomId += alphabet[randomIndex];
  }
  return randomId;
};
const loadcategory = async (req, res) => {

  try {
  
  const id = req.params.id;

  //   const categoryName = id.replace(/%20/g, " ");

    const categoryData = await category.find({ is_listed: true });

    const productt = await product.aggregate([

      { $match: { status: true } },

      {

        $lookup: {

          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",

        },

      },

      { $unwind: "$category" },

      { $match: { "category.name": id } },

    ]);

    if (req.session.user) {

        res.render("users/catagory", {
        login: req.session.user,
        categoryData,
        productt,
        
      });

    } else {

      res.render("users/catagory", { categoryData, productt });

    }

  } catch (error) {
      
    console.log(error.message);

  }

};

const contactLoad = async (req,res)=>{
  try {
    const categoryData = await category.find({ is_listed: true });

    res.render('users/contact',{categoryData })
  } catch (error) {
    console.log(error.message);
    
  }
}
const aboutLoad = async (req,res)=>{
  try {
    const categoryData = await category.find({ is_listed: true });

    res.render('users/about',{categoryData })
  } catch (error) {
    console.log(error.message);
    
  }
}



const catchAll = async (req, res, next) => {
  try {
    const categoryData = await category.find({ is_Listed: true });

    if (req.session.user) {
      res.render("users/404");
    } else {
      res.render("users/404", { categoryData });
    }
  } catch (error) {
    next(error, req, res);
  }
};




module.exports = {
  loadRegister,
  register_user,
  login_user,
  verify_otp,
  products,
  productDetails,
  resend_otp,
  loadAuth,
  successGoogleLogin,
  failureGoogleLogin,
  loadHome,
  loadLogin,
  loadLogout,
  loadShop,
  cartAction,
  priceFilter,
  catchAll,
  aAzZ,
  zZaA,
  lowToHigh,
  highTolow,
  newArrivals,
  searchProduct,
  filterByCategory,
  loadWallet,
  loadcategory,
  contactLoad,
  aboutLoad,
};
