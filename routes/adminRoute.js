const express = require("express");
const admin_router = express();
const adminController = require("../controllers/adminController");
const categoryController = require("../controllers/categoryController");
const productController = require("../controllers/productController");
const admin_order = require('../controllers/adminOrderController')
const admin_middilware = require('../middleware/adminAuth');
const coupen_controller = require('../controllers/coupenController');
const adminOffer = require('../controllers/admin_offer');
const salesReportController = require('../controllers/adminReports');
const path = require("path");

const bodyParser = require("body-parser");
admin_router.use(bodyParser.json());
admin_router.use(bodyParser.urlencoded({ extended: true }));
admin_router.use(
  "/asset",
  express.static(path.join(__dirname, "../public/asset"))
);

const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/productImage"));
  },

  filename: (req, file, cb) => {
    const name = Date.now() + " - " + file.originalname;
    cb(null, name);
  },
});
 
const upload = multer({
  storage: storage,

  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
});

admin_router.get("/",admin_middilware.isLogout, adminController.renderLogin);
 

admin_router.get("/userList",admin_middilware.isLogin,  adminController.loadusers);
admin_router.post("/adminLogin", adminController.handleLogin);
admin_router.post("/adminLogout", adminController.handleLogout);
admin_router.get("/dashboard", admin_middilware.isLogin, adminController.renderDashboard);

//  Year Chart (put)
admin_router.put('/chartYear', adminController.chartYear);

//  Month Chart (put)
admin_router.put('/monthChart', adminController.monthChart);


//for blocking


admin_router.get("/admin/users/:id", admin_middilware.isLogin, adminController.toggleBlockUser);

// Category routes

admin_router.get("/adminCategory", admin_middilware.isLogin, adminController.adminCategory);
admin_router.post("/addCatee", categoryController.addCategory);
admin_router.put("/CateEdit", categoryController.editCategory);
admin_router.put("/Categoryaction", categoryController.categoryAction);

//product
admin_router.get("/products", admin_middilware.isLogin, productController.loadProducts);
admin_router.get("/productsAdd", admin_middilware.isLogin, productController.loadAddproduct);
admin_router.post(
  "/productsAdd",
  upload.array("images", 3),
  productController.addProducts
);
admin_router.get("/editProduct", admin_middilware.isLogin, productController.loadeditProduct);
admin_router.put("/productStatus", productController.productStatus);
admin_router.post(
  "/productedit/:id",
  upload.fields([
    { name: "image0", maxCount: 1 },
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
  ]),
  productController.editProduct
);
admin_router.get("/products", admin_middilware.isLogin, productController.loadProducts);
admin_router.get("/products", admin_middilware.isLogin, productController.loadProducts);


//  Orders 
admin_router.get('/orders', admin_middilware.isLogin,admin_order.loadOrderss);
admin_router.get('/ordDetails',admin_middilware.isLogin,  admin_order.ordersDetails);
admin_router.put("/orderStatusHandling", admin_order.orderProstatus);
admin_router.post("/retordmanage",admin_order.returnorderManage)


//Coupen
admin_router.get('/adminCoupen',admin_middilware.isLogin , coupen_controller.loadAdminCoupen);
admin_router.post('/addCoupen', upload.array('image', 1), coupen_controller.addCoupen);
admin_router.put("/deletCoupen", coupen_controller.deleteCoupen);
admin_router.put("/copenAction", coupen_controller.coupenAction);


 

//  Admin Offer Section :-
admin_router.get('/adminOffer',admin_middilware.isLogin,  adminOffer.loadOffer);
admin_router.post('/addOffer', adminOffer.addOffer);
admin_router.put('/offerRemove', adminOffer.offerRemove);


//  loadReport 
admin_router.get('/salesReport/:id',admin_middilware.isLogin, salesReportController.loadReport);
admin_router.put("/cstmReport", salesReportController.customReport);


module.exports = admin_router;
