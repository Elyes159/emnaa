
const mongoose = require('mongoose')

const Cart = mongoose.model('Cart',{
  
    userid: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
    }],
    productid: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product' 
    }],
   
    
})

module.exports = Cart;