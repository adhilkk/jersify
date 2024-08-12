const Address = require("../models/address");
const User = require("../models/userModel");
const Product = require("../models/product");
const Category = require("../models/categoryModel");
const Coupen = require('../models/coupen_model');
const Cart = require('../models/cart');
const Order = require('../models/orderModel');
const razorPay = require('../controllers/razorpay');
const crypto = require('crypto');
const Wallet= require("../models/wallet");
const Sequence = require("../models/Sequence");



const loadCheckout = async (req, res , next) => {
    
    try {

       
        

        const categoryData = await Category.find({ is_Listed: true });

         
        if (req.session.user) {
            
            const msg = req.flash('flash');
            
            const userData = await User.findById({ _id: req.session.user._id });
            
            const addresData = await Address.findOne({ userId: req.session.user._id });
            
            const cartDataa = await Cart.findOne({ userId: req.session.user._id }).populate('product.productId');

            
         
            if (cartDataa) {
                const coupenData = await Coupen.find({ status: true });

               
                let newTprice = cartDataa.product.reduce((acc, val) => acc + val.price, 0);

               
                
                const cartData = await Cart.findOneAndUpdate({ userId: req.session.user._id }, { $set: { totalCartPrice: newTprice } }, { upsert: true, new: true });

                const b= cartData.product.disAmount
            
                            
                res.render("users/checkout", { login: req.session.user,coupenData, categoryData, addres: addresData, userData, msgg: msg ,cartData,newTprice});
                
            } else {

                res.redirect('/login')

            }

        } else {

            res.redirect('/login')


        }

    } catch (error) {

        next(error,req,res);

        
    }

};


const verifyCheckOutAddress = async (req, res, next) => {
    try {
        const userId = req.query.id;
        const newAddress = req.body.addressData;

        // Set the status of the current default address to false
        await Address.updateOne(
            { userId: userId, "addresss.status": true },
            { $set: { "addresss.$.status": false } }
        );

        // Check if the new address already exists
        const exist = await Address.findOne({
            userId: userId,
            addresss: { $elemMatch: { address: newAddress.address } }
        });

        if (!exist) {
            // Add new address with status true
            const verifyAddress = await Address.findOneAndUpdate(
                { userId: userId },
                {
                    $addToSet: {
                        addresss: {
                            name: newAddress.name,
                            city: newAddress.city,
                            state: newAddress.state,
                            pincode: newAddress.pincode,
                            phone: newAddress.phone,
                            locality: newAddress.locality,
                            address: newAddress.address,
                            status: true
                        }
                    }
                },
                { new: true, upsert: true }
            );

            if (verifyAddress) {
                res.send({ success: true });
            } else {
                res.status(500).send({ success: false, message: "Error adding address" });
            }
        } else {
            // If address already exists, update its status to true
            const updateStatus = await Address.findOneAndUpdate(
                { userId: userId, "addresss.address": newAddress.address },
                { $set: { "addresss.$.status": true } },
                { new: true }
            );

            if (updateStatus) {
                res.send({ success: true });
            } else {
                res.status(500).send({ success: false, message: "Error updating address status" });
            }
        }
    } catch (error) {
        res.status(400);
        next(error, req, res);
    }
};




const deleteAdd = async (req, res , next) => {
    
    try {

        const userId = req.query.id
        const addId = req.query.addId

        const deleteAdd = await Address.updateOne({ userId: userId }, { $unset: { addresss: { _id: addId } } });

        if (deleteAdd) {
            
            res.send(true);

        }
        
    } catch (error) {

        next(error, req, res);
        
    }

}



const editAddress = async (req, res , next) => {
    
    try {

        const { edit } = req.body;
        const editData = await Address.findOne({ 'addresss._id': edit }, { 'addresss.$': 1 });
        
        res.json({ editData });
        
    } catch (error) {

        next(error,req,res);

        
    }

};



const verifyEditAddress = async (req, res , next) => {
    
    try {

        const userId = req.session.user._id;

        const { name, phone, locality, pincode, address, city, state, id } = req.body;

        const editAddress = await Address.findOneAndUpdate({ userId: userId, 'addresss._id': id }, { $set: { 'addresss.$.name': name, 'addresss.$.phone': phone, 'addresss.$.locality': locality, 'addresss.$.pincode': pincode, 'addresss.$.address': address, 'addresss.$.city': city, 'addresss.$.state': state } });

        if (editAddress) {
            
            req.flash('flash', 'Address Edited');
            res.redirect('/checkout');

        }
        
    } catch (error) {

        next(error,req,res);

        
    }

};



const chooseAddress = async (req, res , next) => {
    
    try {

        const addId = req.query.id

        const userIdd = req.session.user._id;

        const update = await Address.bulkWrite([
        
            {
              
                updateOne: {
                
                    filter: { userId: userIdd, "addresss.status": true },
                    update: { $set: { "addresss.$.status": false } },
              
                },
                
            },

            {
              
                updateOne: {
                
                    filter: { userId: userIdd, "addresss._id": addId },
                    update: { $set: { "addresss.$.status": true } },
              
                },
                
            },
          
        ]);
        
    } catch (error) {

        next(error,req,res);

        
    }

};







const changeProStatus = async (req, res, next) => {
    
    try {

        const ordIdd = req.body.ordIdd

        const ord = await Order.findOne({ _id: ordIdd });

        const updation = await Order.findOneAndUpdate({ _id: ordIdd }, { $set: { 'products.$[].orderProStatus': 'pending' } });

        

        ord.products.forEach(async (e) => {
            
            let productt = await Product.findOne({ _id: e.productId });
            
            let newStock = productt.stock - e.quantity;
            
            await Product.findOneAndUpdate({ _id: e.productId }, { $set: { stock: newStock } });
            
        });

        if (updation) {
            
            res.send({ suc: true })
           

        }
        
    } catch (error) {

        next(error, req, res)
        
    }

};


//  Payment Method (RazorPay Post Method) :-


const RazorPay = async (req, res) => {
     
    try {

        const userIdd = req.session.user._id;

        if (userIdd) {

            const cartData = await Cart.findOne({ userId: userIdd });

            const addressData = await Address.findOne({ userId: userIdd });

            if (!cartData || cartData.product.length == 0) {
                
                res.send({ emptyCart: true });

            } else if (addressData.addresss.length == 0) {
                
                res.send({ noAddress: true });

            } else {

                const user = await User.findOne({ _id: req.session.user });
                const amount = req.body.amount * 100;

              
        
                const options = {
        
                    amount: amount,
                    currency: "INR",
                    receipt: "absharameen625@gmail.com",
                    
                };
        
                razorPay.orders.create(options, (err, order) => {
        
                    if (!err) {
        
                        res.send({
        
                            succes: true,
                            msg: "ORDER created",
                            order_id: order.id,
                            amount: amount,
                            key_id: process.env.RAZORPAY_IDKEY,
                            name: user.fullName,
                            email: user.email,
        
                        });
        
                    } else {
        
                        console.error("Error creating order:", err);
        
                        res.status(500).send({ success: false, msg: "Failed to create order" });
                    }
        
                });

            }

        } else {

            res.redirect('/login');

        }
    
    } catch (error) {

        console.log(error.message);
        
    }

};

async function getNextSequence(name) {
    const sequence = await Sequence.findOneAndUpdate(
      { name: name },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    return sequence.value;
  }

const failRazorpay = async (req, res) => {
    
    try {

        console.log("1");
        
        const orderId = await getNextSequence('orderId'); 

        const userIdd = req.session.user._id

        const cart = await Cart.findOne({ userId: userIdd });

        const payMethod = req.body.payment;

        const addres = await Address.findOne({ userId: userIdd, 'addresss.status': true }, { 'addresss.$': 1 });

        const { name, phone, address, pincode, locality, state, city } = addres?.addresss?.[0] ?? {};
        console.log("2");


        const getFailedOrd = await Order.create({
            orderId: orderId, 
            userId: userIdd,

            products: cart.product.map((val) => ({

                productId: val.productId,
                quantity: val.quantity,
                price: val.price,
                orderProStatus: 'payment pending'

            })),

            deliveryAddress: {

                name: name,
                phone: phone,
                address: address,
                locality: locality,
                city: city,
                state: state,
                pincode: pincode,
            },

            orderDate: Date.now(),
            orderStatus:'pending',
            orderAmount: cart.Total_price,
            payment: payMethod,
            overallDis: cart.coupenDisPrice,
            percentage: cart.percentage,

        });
        console.log("3");
        console.log(getFailedOrd);

        await Cart.updateOne({userId : userIdd} , {$unset : {products : 1 , coupenDisPrice : 0, percentage:0 , Total_price :0}});

        if (getFailedOrd) {
            
            res.redirect("/orders");

        }
        
    } catch (error) {

        console.log(error.message); 
        
    }

};
const sucRazorpay = async (req, res, next) => {

    
    try {

        const userIdd = req.session.user._id;

        if (userIdd) {


            const user = await User.findOne({ _id: req.body.userId });
            const amount = req.body.amount * 100;
        
            const options = {
        
                amount: amount,
                currency: "INR",
                receipt: "absharameen625@gmail.com",
                    
            };
        
            razorPay.orders.create(options, (err, order) => {
        
                if (!err) {
        
                    res.send({
        
                        succes: true,
                        msg: "ORDER created",
                        order_id: order.id,
                        amount: amount,
                        key_id: process.env.RAZORPAY_IDKEY,
                        name: user.fullName,
                        email: user.email,
        
                    });
        
                } else {
        
                    console.error("Error creating order:", err);
        
                    res.status(500).send({ success: false, msg: "Failed to create order" });
                }
        
            });

        } else {

            res.redirect('/login');

        }
    
    } catch (error) {

        next(error, req, res);

        
    }

};

module.exports = {

    loadCheckout,
    verifyCheckOutAddress,
    deleteAdd,
    editAddress,
    verifyEditAddress,
    chooseAddress,
    changeProStatus,
    RazorPay,
    failRazorpay,
    sucRazorpay

}; 