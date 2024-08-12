const mongoose=require('mongoose')

const productSchema=new mongoose.Schema({
   name: {type:String,required:true},
   brand: {type:String,required:true,default:'Nike'},
    price:{type:Number,required:true},
    stock:{type:Number,required:true},
    offer:{type:Number,required:true,default:0},
    status:{type:Boolean,default:true},
    image:{type:Array,required:true},
    category:{type:mongoose.Schema.Types.ObjectId,required:true,ref:'Category'},
    description:{type:String,requried:true},
    createdAt:{type:Date,requried:true},
    discount: { type: Number, default: 0 },
    dis_price : {type : Number , default : 0}



})
module.exports=mongoose.model('product',productSchema)