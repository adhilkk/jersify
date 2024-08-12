
const Address = require('../models/address');
const User = require('../models/userModel');
const Product = require('../models/product');
const Category = require('../models/categoryModel');




const loadAddress = async (req, res , next) => {
    
    try {

        const categoryData = await Category.find({ is_Listed: true });
        
        if (req.session.user) {

            const msg = req.flash('flash');
            
            const userData = await User.findById({ _id: req.session.user._id });   

            const addressDataa = await Address.findOne({ userId: req.session.user._id})  

            res.render('users/address', { login: req.session.user, categoryData, userData, msgg: msg, address: addressDataa });

        } else {

            

        }
        
    } catch (error) {

        next(error,req,res);

        
    }

};


const addAddress = async (req, res , next) => {
    
    try {
        
        const userId = req.query.id
       
        
        const exist = await Address.findOne({ userId: userId, addresss: { $elemMatch: { address: req.body.addressData.address } } });

        if (!exist) {
            
            const verifyAddress = await Address.findOneAndUpdate(
              { userId: req.query.id },

              {
                $addToSet: {
                  addresss: {
                    name: req.body.addressData.name,
                    city: req.body.addressData.city,
                    state: req.body.addressData.state,
                    pincode: req.body.addressData.pincode,
                    phone: req.body.addressData.phone,
                    locality: req.body.addressData.locality,
                    address: req.body.addressData.addresss,
                  },
                },
              },
              { new: true, upsert: true }
            );
            
            if (verifyAddress) {
                
                res.send({success : true});

            } else {

                console.log(error.message);

            }
            
        } else {

            res.status(400).send({ exist: true });

        }
        
    } catch (error) {

        res.status(400);
        next(error,req,res);

        
    }

};


const deleteAddress = async (req, res , next) => {
    
    try {

        const userId = req.query.id
        const addressId = req.query.addid;

        const deleteAddress = await Address.updateOne({ userId: userId }, { $pull: { addresss: { _id: addressId } } });

        if (deleteAddress) {
            
            res.send(true);

        }

    } catch (error) {

        next(error,req,res);

        
    }

};


const chooseAddress = async (req, res) => {
    
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

        console.log(error.message);
        
    }

};


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

        const user_Id = req.session.user._id;
        const { name, phone, locality, pincode, address, city, state, id } = req.body;

        const editAddress = await Address.findOneAndUpdate({ userId: user_Id, 'addresss._id': id }, { $set: { 'addresss.$.name': name, 'addresss.$.phone': phone, 'addresss.$.locality': locality, 'addresss.$.pincode': pincode, 'addresss.$.city': city, 'addresss.$.state': state, 'addresss.$.address': address } });

        if (editAddress) {
          
            req.flash('flash', 'Address Edited');
            res.redirect('/address');

        }
        
    } catch (error) {

        next(error,req,res);

        
    }

};

module.exports = {

    loadAddress,
    addAddress,
    deleteAddress,
    chooseAddress,
    editAddress,
    verifyEditAddress,

};