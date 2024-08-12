const express = require('express');
require('dotenv').config();
const user_router = express()
const user_Controller= require('../controllers/userController');
const cart_controller= require('../controllers/cartController');
const profile_controller= require('../controllers/userprofile');
const address_controller= require('../controllers/addressController');
const checkoutController= require('../controllers/checkoutController');
const user_coupen= require('../controllers/coupenController');
const orderController= require('../controllers/orderController');
const user_wishlist= require('../controllers/userWshlist');
const userAuth = require('../middleware/userAuth')
const passport = require('passport')
require('../passport')

user_router.use(passport.initialize())
user_router.use(passport.session())
user_router.set('view engine', 'ejs');

const bodyParser = require("body-parser");
user_router.use(bodyParser.json());
user_router.use(bodyParser.urlencoded({extended:true}));

const multer = require("multer");
const path = require("path");
user_router.use(express.static('public'))

  
user_router.get('/' , user_Controller.loadHome)
user_router.post('/login',user_Controller.login_user);
user_router.get('/login' ,userAuth.loginUser, user_Controller.loadLogin)
user_router.get('/logout' ,userAuth.user, user_Controller.loadLogout)
user_router.get('/shop' ,userAuth.blockuser, user_Controller.loadShop)
user_router.get('/category/:id',user_Controller.loadcategory)




user_router.get('/registerPage',user_Controller.loadRegister)
user_router.post('/register', user_Controller.register_user);
user_router.post('/verify-otp', user_Controller.verify_otp); 
user_router.post('/resend-otp', user_Controller.resend_otp);



// Auth 
user_router.get('/auth/google' , passport.authenticate('google', { scope: 
	[ 'email', 'profile' ] 
})); 

// Auth Callback 
user_router.get( '/auth/google/callback', 
	passport.authenticate( 'google', { 
		successRedirect: '/success', 
		failureRedirect: '/failure'
	}));
	
// Success 
user_router.get('/success' , user_Controller.successGoogleLogin); 
// failure 
user_router.get('/failure' , user_Controller.failureGoogleLogin);

	
//user profile 
	
user_router.get('/profile',userAuth.blockuser,userAuth.user,profile_controller.profileLoad)
user_router.post('/editProfile',profile_controller.editProfile)
user_router.post('/editPassword',profile_controller.passCange)
user_router.get('/Address',userAuth.blockuser,address_controller.loadAddress)
user_router.post('/addAddress',address_controller.addAddress)
user_router.post('/deleteAdd',address_controller.deleteAddress)
user_router.put("/editAddress", address_controller.editAddress);
user_router.post("/verifyEditAddress", address_controller.verifyEditAddress);
user_router.post("/chooseAddress", address_controller.chooseAddress);



//produts

user_router.get('/product', user_Controller.products);
user_router.get('/productDetails',user_Controller.productDetails)



//contact
user_router.get('/contact',user_Controller.contactLoad)

//about
user_router.get('/about',user_Controller.aboutLoad)

	
// cart


user_router.get('/cart',userAuth.blockuser,userAuth.user,cart_controller.cartLoad)
user_router.post('/addCart',cart_controller.addCart)
user_router.put('/cartUpdate' , cart_controller.cartEdit)
user_router.put('/deleteCart' , cart_controller.deleteCart);
user_router.post("/cartAction", user_Controller.cartAction);


//  Filter 
user_router.put('/priceFilter', user_Controller.priceFilter);
user_router.put("/newArrivals", user_Controller.newArrivals);
user_router.put("/aAzZ", user_Controller.aAzZ);
user_router.put("/zZaA", user_Controller.zZaA);
user_router.put("/lowToHigh", user_Controller.lowToHigh);
user_router.put('/highTolow', user_Controller.highTolow);


//  Orders 

user_router.get('/orders',userAuth.blockuser,  orderController.loadOrder);
user_router.get("/orderDetails",userAuth.blockuser,  orderController.orderView);
user_router.post('/getOrder', orderController.orderRecieved);
user_router.get('/thanks',userAuth.blockuser, orderController.loadThanks);
user_router.post('/cancelOrd', orderController.orderCancel);
user_router.put('/returnOrd', orderController.returnOrd);


//  CheckOut

user_router.get('/checkout',userAuth.blockuser,checkoutController.loadCheckout);
user_router.post("/verifyChekutAdss", checkoutController.verifyCheckOutAddress);
user_router.put("/editAddressCheckout", checkoutController.editAddress);
user_router.post('/verifyEditAddCheckout', checkoutController.verifyEditAddress);
user_router.post('/deleteCheckAdd', checkoutController.deleteAdd);







//  razorPay (post)
user_router.post("/razorPay", checkoutController.RazorPay);
user_router.post("/failedRazorpay", checkoutController.failRazorpay);
user_router.post('/sucRazorpay', checkoutController.sucRazorpay);
user_router.post('/changeStatus' , checkoutController.changeProStatus)





//  Coupen Section :-

//  Coupen (get)
user_router.get('/coupen',userAuth.blockuser, user_coupen.loadCoupen);
user_router.post('/coupenCehck', user_coupen.coupenCheck);
user_router.post('/useCoupen', user_coupen.useCoupen);
user_router.put('/removeCop', user_coupen.remove);




//  Search Producct
user_router.put("/searchProduct", user_Controller.searchProduct);


//  Wishlist Section :-
user_router.get('/wish',userAuth.blockuser, user_wishlist.loadWishlist);
user_router.post('/addWishlist', user_wishlist.addWishlist);
user_router.put('/removeWishlist', user_wishlist.removeWishlist);



// filter on category

user_router.post("/filterByCategory", user_Controller.filterByCategory);
user_router.get("/wallet",userAuth.blockuser, user_Controller.loadWallet);



//  Download Invoice
user_router.get("/downloadInvoice",userAuth.blockuser, orderController.downloadInvoice);

//  404 Page :-
user_router.get('/404', user_Controller.catchAll);
 
module.exports = user_router;
    