const User = require("../models/userModel")
const Admin = require("../models/adminModel")
const bcrypt = require("bcryptjs");
const Category = require("../models/categoryModel")
const categoryController= require('../controllers/categoryController');
const Order= require('../models/orderModel');
const Product = require('../models/product');

const dotenv = require('dotenv');
dotenv.config({ path: 'config.env' });




// load userlist to dashboard

const loadusers = async(req,res)=>{
    try {
        

        const limit = 5;
        const page = parseInt(req.query.page) || 1
        const skip = (page -1 ) * limit;

        const totalusercount = await User.countDocuments()
        const totalPages = Math.ceil(totalusercount / limit)

        const userData = await User.find()

        .skip(skip)
        .limit(limit)

        

        res.render('../views/admin/userList.ejs',{clint : userData, currentPage : page,totalPages})
       
    } catch (error) {
        console.log(error.message);
    }
}




const renderLogin = (req, res) => {
    res.render('admin/adminLogin');
  };
  
  const handleLogin = async (req, res) => {
    const { adminEmail, password } = req.body;

    
  
    try {
      const admin = await Admin.findOne({ email:adminEmail.trim() });
      
  
      if (!admin) {
        return res.render('admin/adminLogin.ejs', { loginMsg: 'Invalid email or password', loginSuccess: false });
      }
  
      const isPasswordValid = await bcrypt.compare(password, admin.password);
  
      if (!isPasswordValid) {
        return res.render('admin/adminLogin.ejs', { loginMsg: 'Invalid email or password', loginSuccess: false });
      }
  
      // If email and password are correct, redirect to the dashboard

      if (!req.session.admin) {
        req.session.admin = {};
      }
      
      req.session.admin = admin._id;
      
      res.redirect('/admin/dashboard');
  
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).send('Internal server error');
    }
  };

  const handleLogout = async (req , res) => {

    try {
  
      if(req.session.admin){
  
        req.session.admin = undefined
        res.redirect('/admin')
  
      } else {
  
        res.redirect('/admin/dashboard')
  
      }
  
    } catch (error) {
  
      console.log(error.message);
      
    }
  
  }
  
  
  const renderDashboard = async(req, res) => {
    try {
      const order = await Order.find();   //  Order

      const totalOrdAmount = order.reduce((acc, val) => acc + val.orderAmount, 0);    
      const totalOrdDiscount = order.reduce((acc, val) => acc + val.overallDis, 0);    
    
  
      
    const totalProduct = await Product.find()  

    //  Best Selling Products :-

    const bestSellPro = await Order.aggregate([
        
      {
        $unwind: "$products",
      },

      {
        $group: {

          _id: "$products.productId",
          ttlCount: { $sum: "$products.quantity" },
                    
        },
      },

      {
        $lookup: {

          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productData",
        },
      },

      {
        $sort: { ttlCount: -1 },
      },

      {
        $limit: 5,
      },

    ]);
      
    //  Top Selling Category :-

    const bestSellCate = await Order.aggregate([
    
      { $unwind: "$products" },

      {
        $group: {

          _id: "$products.productId",
          totalQuantity: { $sum: "$products.quantity" },
        },

      },

      { $sort: { totalQuantity: 1 } },
      { $limit: 3 },

      {

        $lookup: {

          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",

        },

      },

      { $unwind: "$productDetails" },

      {
        $lookup: {

          from: "categories",
          localField: "productDetails.category",
          foreignField: "_id",
          as: "categoryDetails",

        },

      },

      {
        $group: {

          _id: "$categoryDetails._id",
          categoryName: { $first: "$categoryDetails.name" },
          totlCate: { $sum: "$totalQuantity" },
        },

      },

      { $sort: { totalCategoryQuantity: 1 } },

      { $limit: 2 },

    ]);

    //  Top Selling Brand :-

    const bestSellBrand = await Order.aggregate([
    
      {
        $unwind: "$products",
      },

      {

        $group: {

          _id: "$products.productId",
          totalQuantity: { $sum: "$products.quantity" },
          
        },

      },

      {

        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },

      },

      {
        $unwind: "$product",
      },

      {

        $group: {

          _id: "$product.brand",
          totalQuantity: { $sum: "$totalQuantity" },

        },

      },

      {
        $sort: { totalQuantity: -1 },
      },

      {
        $limit: 3,
      },

    ]);
    
  
      res.render("admin/dashboard", { order, totalOrdAmount, totalOrdDiscount, totalProduct, bestSellPro, bestSellCate, bestSellBrand})
    } catch (error) {
        console.log(error.message);
    }
  };


  //blockingggg

  const getUsers = async (req, res) => {
    try {
      const users = await User.find({});
     
      res.render('admin/users', { clint: users });
    } catch (error) {
      res.status(500).send(error.message);
    }
  };
  
  const toggleBlockUser = async (req, res) => {
    const userId = req.params.id;
    
    try {
      const user = await User.findById(userId);
      user.is_blocked = !user.is_blocked;
      await user.save();
      
      res.sendStatus(200);
    } catch (error) {
      res.status(500).send(error.message);
    }
  };


//adminCategory

const adminCategory = async (req, res) => {

  try {

      const limit = 5;
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * limit;

      const totalCatCount = await Category.countDocuments();
      const totalPages = Math.ceil(totalCatCount / limit);

      const categoryData = await Category.find()

      .skip(skip)
      .limit(limit);

      res.render("../views/admin/adminCategory.ejs" , {Category : categoryData ,  currentPage: page, totalPages});
      
  } catch (error) {
      
      console.log(error.message);

  }

};


//  Year Chart (Put Method) :-

const chartYear = async (req, res , next) => {

  try {

    const curntYear = new Date().getFullYear();

    const yearChart = await Order.aggregate([
        
      {
        
        $match: {

          orderDate: {

            $gte: new Date(`${curntYear - 5}-01-01`),
            $lte: new Date(`${curntYear}-12-31`),

          },

        },

      },

      {
        $group: {

          _id: { $year: "$orderDate" },
          totalAmount: { $sum: "$orderAmount" },

        },

      },

      {
        $sort: { _id: 1 },
      },

    ]);

    res.send({ yearChart });

  } catch (error) {

    next(error,req,res);


  }

};

//  Month Chart (Put Method) :-

const monthChart = async (req, res , next) => {

  try {
    
    const monthName = [

      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const curntYear = new Date().getFullYear();

    const monData = await Order.aggregate([
    
      {
        $match: {

          orderDate: {

            $gte: new Date(`${curntYear}-01-01`),
            $lte: new Date(`${curntYear}-12-31`),
            
          },

        },
      },

      {
        $group: {
          _id: { $month: "$orderDate" },
          totalAmount: { $sum: "$orderAmount" },
        },
      },

      {
        $sort: { _id: 1 },
      },

    ]);

    const salesData = Array.from({ length: 12 }, (_, i) => {

      const monthData = monData.find((item) => item._id === i + 1);

      return monthData ? monthData.totalAmount : 0;

    });

    res.json({ months: monthName, salesData });

  } catch (error) {

    next(error,req,res);

  }

};






module.exports= {
    loadusers,
    renderDashboard,
    handleLogin,
    renderLogin,
    getUsers,
    toggleBlockUser,
    adminCategory,
    handleLogout,
    chartYear,
    monthChart
  
    
}

