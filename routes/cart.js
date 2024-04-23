const express = require('express')

const router = express.Router();
const Cart = require('../models/cart')
const mongoose = require('mongoose');

const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const app = express()



const store = new MongoStore({
    mongooseConnection: mongoose.connection,
    collection: 'sessions'
  });


app.use(session({
  secret: '123456789', 
  resave: false,
  saveUninitialized: true,
  store: store
}));

  router.post('/api/cart/add', async (req, res) => {
    const productId = req.body.productId;
    const quantity = req.body.quantity || 1; 
  
    // Vérifier si l'utilisateur est connecté
    if (!req.session.userId) {
      if (!req.session.cart) {
        req.session.cart = { products: [] };
      }
  
      // Ajouter le produit au panier de session
      const existingProductIndex = req.session.cart.products.findIndex(p => p.productId === productId);
      if (existingProductIndex !== -1) {
        req.session.cart.products[existingProductIndex].quantity += quantity;
      } else {
        req.session.cart.products.push({ productId, quantity });
      }
  
      res.json({ message: 'Produit ajouté au panier avec succès.' });
      return;
    }
  
    // Utilisateur connecté, créer ou mettre à jour le panier utilisateur
    const userId = req.session.userId;
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, products: [] });
    }
  
    const existingProductIndex = cart.products.findIndex(p => p.productId === productId);
    if (existingProductIndex !== -1) {
      Cart.products[existingProductIndex].quantity += quantity;
    } else {
      Cart.products.push({ productId, quantity });
    }
  
    await cart.save();
    res.json({ message: 'Produit ajouté au panier avec succès.' });
  });






  app.get('/api/cart', async (req, res) => {
    if (!req.session.userId) {
      // Utilisateur non connecté, renvoyer un panier vide
      res.json({ products: [] });
      return;
    }
  
    const userId = req.session.userId;
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      // Panier utilisateur inexistant, renvoyer un panier vide
      res.json({ products: [] });
      return;
    }
  
    const productIds = cart.products.map(p => p.productId);
    const products = await Product.find({ _id: { $in: productIds } });
  
    const enrichedCart = {
      products: cart.products.map(p => {
        const product = products.find(prod => prod._id === p.productId);
        return {
          ...p, 
          name: product.name, 
          price: product.price 
        };
      })
    };
  
    res.json(enrichedCart);
  });

module.exports = router;