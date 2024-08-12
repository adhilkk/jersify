const mongoose = require('mongoose');

const wallteSchema = new mongoose.Schema({

    userId: {
        
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
        
    },history: [{
        amount: {
            type: Number
        },
        transactionType: {
            enum: ['credit', 'withdraw', 'Ordered', 'razorpay', 'return', 'cancel', 'Referal', 'Referal bonus', 'First order bonus'],
            type: String
        },
        date: {
            type: Date,
            default: Date.now
        },
        previousBalance: {
            type: Number
        }
    }],

    balance: {

        type: Number,
        required: true
        
    },

    transaction: [{
        
        amount: { type: Number },
        time: { type: Date, default: Date.now },
        creditOrDebit: { type: String, enum: ['credit', 'debit'] }

    }]
    

    
});

module.exports = mongoose.model('wallet', wallteSchema);