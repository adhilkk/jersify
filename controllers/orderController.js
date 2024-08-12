const Address = require("../models/address");
const User = require("../models/userModel");
const Product = require("../models/product");
const Category = require("../models/categoryModel");
const Order = require('../models/orderModel');
const Cart = require('../models/cart');
const Wallet = require("../models/wallet");
const Sequence = require("../models/Sequence");

const loadOrder = async (req, res , next) => {

    try {

        const categoryData = await Category.find({ is_Listed: true });

        if (req.session.user) {

            const addressData = await Address.findOne({

                userId: req.session.user._id,

            });

           

            const orderData = await Order.find({ userId: req.session.user._id })
                
                .populate("products.productId")
            
               
 
                

            res.render("users/orders", {

                login: req.session.user,
                categoryData,
                address: addressData,
                orderData,
                 

            });

        } else {

            res.redirect("/login");

        }

    } catch (error) {

        next(error,req,res);


    }

};



const orderView = async (req, res , next) => {
      
    try {
        
        const categoryData = await Category.find({ is_Listed: true });

        const order = await Order.findOne({ _id: req.query.id }).populate('products.productId');
       
        

        res.render('users/orderDetails', { login: req.session.user, order, categoryData });
        
    } catch (error) {
        
        next(error, req, res);
        
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


const orderRecieved = async (req, res , next) => {
    
    try {

        const userIdd = req.session.user._id
        const user = req.session.user;

        if (userIdd) {

            const cartData = await Cart.findOne({ userId: userIdd });

            const addressData = await Address.findOne({ userId: userIdd });

            if (!cartData || cartData.product.length == 0) {

                req.flash('flash', 'Cart Empty');
                res.redirect("/checkout");

            } else if (!addressData || addressData.addresss.length == 0) {
                
                req.flash('flash', 'No Address');
                res.redirect("/checkout");

            } else {


                 

                const existingOrders = await Order.findOne({ userId: userIdd });
                let isFirstOrder = false;
                let referedCode = null;
        
                if (!existingOrders) {
                    isFirstOrder = true;
                    referedCode = user.referedCode; 
                    
                    if (referedCode) {
                       
                        const referedUser = await User.findOne({ referenceCode: referedCode });
                        if (referedUser) {
                            const referedUserId = referedUser._id;
                            let referedUserWallet = await Wallet.findOne({ userId: referedUserId });
                            if (!referedUserWallet) {
                                referedUserWallet = new Wallet({
                                    userId: referedUserId,
                                    balance: 50,
                                    history: [{
                                        amount: 50,
                                        transactionType: "Referal bonus",
                                        previousBalance: 0
                                    }]
                                });
                            } else {
                                referedUserWallet.balance += 50;
                                referedUserWallet.history.push({
                                    amount: 50,
                                    transactionType: "Referal bonus",
                                    previousBalance: referedUserWallet.balance - 50
                                });
                            }
                            await referedUserWallet.save();
                         
        
                            let currentUserWallet = await Wallet.findOne({ userId: userIdd });
                            if (!currentUserWallet) {
                                currentUserWallet = new Wallet({
                                    userId: userIdd,
                                    balance: 30,
                                    history: [{
                                        amount: 30,
                                        transactionType: "First order bonus",
                                        previousBalance: 0
                                    }]
                                });
                            } else {
                                currentUserWallet.balance += 30;
                                currentUserWallet.history.push({
                                    amount: 30,
                                    transactionType: "First order bonus" ,
                                    previousBalance: currentUserWallet.balance - 30
                                });
                            }
                            await currentUserWallet.save();
                        
                        }
                    }
                }













                const peyMethod = req.body.payment
        
                const cartt = await Cart.findOne({ userId: userIdd });

                const proExactPrice = cartt.product[0].price

                // const WalletData = await Wallet.findOne({ userId: userIdd });
        
                const addresss = await Address.findOne({ userId: userIdd, 'addresss.status': true }, { 'addresss.$': 1 });
        
                const product = cartt.product;
                const { name, phone, address, pincode, locality, state, city } = addresss?.addresss?.[0] ?? {};
                const orderId = await getNextSequence('orderId'); 

               


                const sumDiscount= product.reduce((acc, val) => acc + val.discountAmount, 0);
                const sumDisAmount= product.reduce((acc, val) => acc + val.disAmount, 0);


                const orderGot = await Order.create({
        
                    orderId: orderId, 
                    userId: userIdd,
                    products: product,
                    
                    deliveryAddress: { 
                        
                        name: name,
                        phone: phone,
                        address: address,
                        locality: locality,
                        city: city,
                        state: state,
                        pincode: pincode
        
                    },
        

                    orderDate: Date.now(),
                    orderAmount: cartt.Total_price,
                    payment: peyMethod,
                    coupenDis:sumDiscount,
                    percentage: cartt.percentage,
                    overallDis:sumDisAmount
        
                });
                
                req.session.orderGot = orderGot

               

                // if (req.body.peyment == 'wallet') {

                //     const balancee = WalletData.balance - cartt.Total_price

                //     const debitAmount = cartt.Total_price
                    
                //     await Wallet.findOneAndUpdate(
                    
                //         { userId: userIdd },
                      
                //         {
                          
                //             $set: { balance: balancee },
                            
                //             $push: {
                            
                //                 transaction: { amount: debitAmount, creditOrDebit: 'debit' },
                                
                //             },
                            
                //         }
                         
                //     );

                // }

                //  Quantity Managing :-
            
                if (orderGot) {
            
                    orderGot.products.forEach(async (e) => {
            
                        let productt = await Product.findOne({ _id: e.productId });
            
                        let newStock = productt.stock - e.quantity;
            
                        await Product.findOneAndUpdate({ _id: e.productId }, { $set: { stock: newStock } });
            
                    });
                    
                    // orderGot.products.forEach(async (e) => {
            
                    //     // let sum = await Product.findOne({ _id: e.productId });
            
                    //     let newsum = newsum+e.discountAmount;
            
                    //     await Order.findOneAndUpdate({ userId: userIdd,}, { $set: { coupenDis: newsum } });
            
                    // });
            
                    //  Update Cart :-
            
                    const cartRemove = await Cart.updateOne({ userId: userIdd }, { $unset: { product : 1, }, $set: {Total_price: 0, coupenDisPrice: 0, percentage: 0 } });
                    await User.findOneAndUpdate({ _id: userIdd }, { $pop: { applyCoupen: 1 } });
                        
                    if (cartRemove) {
            
                        res.redirect('/thanks');
            
                    } else {
                            
                      
            
                    }
        
                }
        
            }
            
        } else {

            req.redirect("/login")

        }
        
    } catch (error) {

        next(error,req,res);

        
    }

};

//  Load Thanks Page (Get Method) :-

const loadThanks = async (req, res , next) => {
    
    try {

        if (req.session.user && req.session.orderGot) {
            
            const categoryData = await Category.find({ is_Listed: true });
            res.render("users/thanksPage", { login: req.session.user, categoryData });

        } else {

            res.redirect('/')

        }
        
    } catch (error) {

        next(error,req,res);

        
    }

};

//  orderCancel (Post Method) :-

const orderCancel = async (req, res ,) => {
    
    try {

        const { proId, ordId, price, reason } = req.body;
        const userIdd = req.session.user._id

        const cancelOrd = await Order.findOneAndUpdate(
        
            { _id: ordId, 'products.productId': proId },
          
            {
              
                $set: {
                
                    'products.$.orderProStatus': 'canceled',
                    'products.$.canceled': true,
                    'products.$.reason': reason,
                
                },
                
            },

            { new: true }
            
        )

        
        //  Adding Stock Back :-

        const orderFind = await Order.findOne({ _id: ordId, "products.productId": proId, "products.canceled": true, }, { "products.$": 1, });
        const order = await Order.findOne({ _id: req.query.id }).populate('products.productId');
        

        if (orderFind) {
            
            const getQuantity = orderFind.products[0].quantity;
    
            await Product.findOneAndUpdate({ _id: proId }, { $inc: { stock: getQuantity } });

            //  Manage The Money :-
            moneyDecrese = orderFind.products[0].price    //  Find Pro Price

            findOrd = await Order.findOne({ _id: ordId, userId: userIdd });   //  Find Order

            ordVal = findOrd.orderAmount;  


            console.log(moneyDecrese,'moneyDecrese');
            console.log(findOrd,'findOrd');
            console.log(ordVal,'ordVal');
            


        }
        //  CancelProduct Amount Adiing The Wallet :-

        if (cancelOrd.peyment != 'COD') {
       












            
            await Wallet.findOneAndUpdate({ userId: userIdd },
            
                {
                    $inc: { balance: ordVal },
                    $push: { history: { amount: ordVal, transactionType: 'credit' } }
                },
                
                { new: true, upsert: true }

            );

            res.send({ succ: true });

        } else {

            res.send({ fail: true });
        }

    } catch (error) {

        console.log(error.message);
        
    }

}


       

       

  

//  ReturnOrder (Post Method) :-

const returnOrd = async (req, res) => {
    
    try {
 
        const { proId, ordId,  reason } = req.body;
        const userIdd = req.session.user._id
        
        //  Return Product :-
        
        const returnMasg = await Order.findOneAndUpdate(
        
            { _id: ordId, "products.productId": proId },
          
            {
                $set: {
                    "products.$.retruned": true,
                    "products.$.reason": reason,
                    "products.$.forButton": true,
                },
            }
          
        );

        if (returnMasg) {
         
            console.log("Okey Anuu");
         
        } else {

            console.log("Okey Allaaaa");

        }

    } catch (error) {

        next(error,req,res);

        
    }

};
   


//  Download Invoice (Put Method) :-

const downloadInvoice = async (req, res , next) => {
    
    try {

        const ordId = req.query.id
        
        const ordData = await Order.find({ _id: ordId }).populate('products.productId userId')

        res.render('users/invoice', { ordData })
        
    } catch (error) {

        next(error,req,res);

        
    }

};



  



module.exports = {

    loadOrder,
    orderRecieved,
    loadThanks,
    orderView,
    orderCancel,
    returnOrd,
    downloadInvoice
    
    

};