
const mongoose = require('mongoose')
const newcart = new mongoose.Schema({
    
    userId : {type : String , required: true} ,
    
    product : [{
        productId : {type : mongoose.Schema.Types.ObjectId , ref :'product',},
        quantity:{type:Number,required:true,default:1},
        price : {type : Number , required : true},
        discountAmount: {type : Number , required : true},
        disAmount: { type: Number,required: true,default: 0},
        

    }],
    
    Total_price : {
        type : Number , 
        required : true
    },
    
    userId: {
        
        type: String,
        required: true
    
    }, 

    coupenDisPrice: {
        
        type: Number,
        required: true,
        default: 0

    },
    
    

    percentage: {
        
        type: Number,
        required: true,
        default: 0
        

    }
})

module.exports = mongoose.model('Cart',newcart)