const User = require("../models/userModel");
const Product = require("../models/product");
const Category = require("../models/categoryModel");
const Order = require("../models/orderModel");
const Cart = require("../models/cart");
const Coupen = require('../models/coupen_model');
// const Wallet = require("../models/wallet");


//  User

const loadCoupen = async (req, res) => {
    
    try {
       
        const categoryData = await Category.find({ is_Listed: true });

        if (req.session.user) {

            const msg = req.flash('flash')

            const coupenData = await Coupen.find({ status: true });
           
             
            res.render("users/coupen", { login: req.session.user, categoryData, coupenData, msgg: msg });

        } else {

            res.redirect('/users/login');

        }
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//  User

const coupenCheck = async (req, res) => {
    
    try {

        const inpValue = req.body.inpVal
        
        const checkCoupen = await Coupen.findOne({ coupenId: inpValue });

        if (checkCoupen) {
            
            res.send({ s: true })

        } else {
           

            res.send({ fail: true })

        }

    } catch (error) {

        console.log(error.message);
        
    }

};

//  Admin

const loadAdminCoupen = async (req, res) => {
    
    try {

        const msg = req.flash("flash");

        const coupenData = await Coupen.find();

        res.render("admin/adminCoupon", { coupenData , msgg : msg});
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//  Admin

const addCoupen = async (req, res) => {
    
    try {

        const { coupon, discount, min, max  } = req.body;

        const newId = generateCoupenId()

        const createCoupen = new Coupen({

            name: coupon,
            discountt: discount,
            from : min,
            to: max,
            coupenId: newId,
            image: req.files[0].filename

        })
        
        if (createCoupen) {
            
            createCoupen.save();
            req.flash("flash", "good");
            res.redirect("/admin/adminCoupen");

        }

    } catch (error) {

        console.log(error.message);
        
    }

};

//  Admin 

const coupenAction = async (req, res) => {
    
    try {

        const copId = req.query.id

        const changeStatus = await Coupen.findOne({ _id: copId });

        changeStatus.status = !changeStatus.status
        changeStatus.save()
        
    } catch (error) {

        
    }

};

//  Using Coupen
const useCoupen = async (req, res , next) => {
    
    try {

        const coupenIdd = req.body.coupen;
        
        const coupen = await Coupen.findOne({ coupenId: coupenIdd, status: true });

        if (coupen) {
            
            const cartData = await Cart.findOne({ userId: req.session.user._id });

           
                
                const cartPrice = cartData.Total_price;  
                const coupenDis = coupen.discountt     
                
                if (coupen) {
                            
                    const offerValue = Math.round((cartPrice) - (cartPrice * coupenDis / 100));
                    const discountedValue = cartPrice - offerValue;
                    const lastdiscount= discountedValue>coupen.to?coupen.to:discountedValue
                   

                
                    const updateCart = await Cart.findOneAndUpdate({ _id: cartData._id }, { $set: { Total_price: offerValue, coupenDisPrice: lastdiscount, percentage: coupen.discountt } }, { new: true });
                    await User.findOneAndUpdate({ _id: req.session.user._id }, { $push: { applyCoupen: coupen.coupenId } });
                
                    if (updateCart) {
                               
                        req.flash("flash", "coupen");
                        res.redirect("/checkout");
                
                    }
                }

           

        } else {



        }
        
    } catch (error) {

        next(error,req,res);

        
    }

};

//  Used Coupen Removing

const remove = async (req, res) => {
    
    try {

        const userIdd = req.session.user._id

        const cartData = await Cart.findOne({ userId: userIdd });

        const addPrice = cartData.product.reduce((total, item) => total + item.price, 0);
        

        const updateCart = await Cart.findOneAndUpdate({ userId: userIdd } , { $set: { Total_price: addPrice}});

        const updateCartt = await Cart.findOneAndUpdate({userId : userIdd} , {$set : {coupenDisPrice : 0 , percentage : 0}})

        await User.findOneAndUpdate({ _id: userIdd }, { $pop: { applyCoupen: 1 } }); 
        
        if (updateCart && updateCartt) {
                
            res.send({ succ: true });
        }
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//  Admin Delete Coupen

const deleteCoupen = async (req, res) => {
    
    try {

        const copId = req.query.id

        const deletCoupen = await Coupen.deleteOne({ _id: copId });

        if (deletCoupen) {
            
            res.send({ succ: true });

        } 
                
    } catch (error) {

        console.log(error.message);
        
    }

};

//  Coupen Id Generating

const generateCoupenId = () => {

    const look = '123456789G'
    let ID = ''
    
    for (let i = 0; i < 6; i++) {

        ID += look[Math.floor(Math.random() * 10)];

    };

    return ID

}

module.exports = {

    loadCoupen,
    coupenCheck,
    loadAdminCoupen,
    addCoupen,
    coupenAction,
    useCoupen,
    remove,
    deleteCoupen
}