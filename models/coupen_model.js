const mongoose = require('mongoose');

const coupenSchema = mongoose.Schema({

    name: {
        
        type: String,
        required: true

    },

    discountt: {
        
        type: Number,
        required: true

    },

    from: {
        
        type: Number,
        required: true

    },

    to: {
        
        type: Number,
        default : true,

    },

    coupenId: {
        
        type: String,
        required: true

    },

    image: {
        
        type: String,
        required: true

    },

    status: {
        
        type: Boolean,
        default: true

    }

});

module.exports = mongoose.model('coupen', coupenSchema);
