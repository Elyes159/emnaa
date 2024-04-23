const mongoose = require('mongoose')

const Product = mongoose.model('Product',{
    title:{
        type : String
    },
    name:{
        type : String
    },
    description:{
        type : String
    },
    price:{
        type : Number
    },
    Image : {
        type : String
    },
   brands: {
        type : String
    },
    quantité: {
        type : String
    },
    cupons: {
        type : String
    },
    disponibilite: {
        type : Boolean
    },
    caracteristique: {
        type : String
    },
    categorie: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categorie' 
    }]
})

module.exports = Product;