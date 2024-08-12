const Product = require("../models/product");
const Category = require("../models/categoryModel");
const Order = require("../models/orderModel");
const Offer = require('../models/adminOffer');



//  loadOffer (Get Method) :-

const loadOffer = async (req, res) => {
    
    try {

        const category = await Category.find({ is_listed: true })

        const offer = await Offer.find().populate('category')

        res.render('admin/offer' , {category , offer});
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//  addOffer (Post Method) :-

const addOffer = async (req, res) => {
    
    try {

        const { offname, category, offer } = req.body;

        const findCategory = await Category.findOne({ name: category })

        const findProduct = await Product.find({'category': findCategory._id }).populate('category');
       
        const exist = await Offer.findOne({

            $or: [
            
                { name: { $regex: new RegExp(offname, 'i') } },

                { category: findCategory._id } 

            ]

        }).populate('category');
        
        if (!exist) {
            
            findProduct.forEach(async (val) => {
            
                const offerPorice = Math.round((val.price / 100) * (100 - offer));
                await Product.findOneAndUpdate({ _id: val._id }, { $set: { discount: offer, dis_price: offerPorice } });

            })
            
            const offerAdd = new Offer({

                name: offname,
                offer: offer,
                category: findCategory._id

            })

            offerAdd.save();
            res.redirect("/admin/adminOffer");

        } else {

            

        }

    } catch (error) {

        console.log(error.message);
        
    }

};

//  offerRemove (Put Method) :-

const offerRemove = async (req, res) => {
    
    try {

        const offerId = req.query.id
        
        
        const removed = await Offer.findOneAndDelete({ _id: offerId });

        const cateId = removed.category._id


        if (removed) {
            
            const r = await Product.updateMany({ category: cateId }, { $set: { discount: 0, discount_price: 0 } });

            res.send({ succ: true })

        } else {

            res.send({ fail: true })

        }

    } catch (error) {

        console.log(error.message);
        
    }

};

module.exports = {

    loadOffer,
    addOffer,
    offerRemove
}