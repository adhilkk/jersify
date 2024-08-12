const mongoose = require ('mongoose')

const category = new mongoose.Schema({
     name:{
        required : true,
        type : String,
        unique:true
     },
     is_listed:{
        require :true,
        type : Boolean,
        default:true
     },
})

module. exports = mongoose.model('Category',category)