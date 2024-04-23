const express = require('express')

const router = express.Router();
const app = express();


const User = require('../models/user');
const { route } = require('./product');

const bcrypt = require('bcrypt')

const jwt = require('jsonwebtoken')
const Product = require('../models/product')
const nodemailer = require("nodemailer")




router.post('/create',async (req,res)=>{
    try{
        data = req.body;
        usr = new User(data);
        savedUser =await usr.save();
        res.status(200).send(savedUser);
    }catch(error){
        res.status(400).send(error)
    }
})
router.post('/register',async (req,res)=>{
    try{
        data = req.body;
        usr = new User(data);
        console.log(data);
        salt = bcrypt.genSaltSync(10);
        cryptedPass = await bcrypt.hashSync(data.password,salt)
        usr.password = cryptedPass;
        savedUser = usr.save()
        res.status(200).send(savedUser);
    }catch(error){
        res.status(400).send(error)
    }
})
router.post('/login',async (req,res)=>{
   
    try{
        data = req.body;
        user = await User.findOne({email : data.email})

        if (!user){
            res.status(404).send('email or password invalid !')
        }else{
            validPass = bcrypt.compareSync(data.password,user.password)
            if (!validPass){
                res.status(401).send('email or password invalid !')
            }else{
                payload = {
                    _id: user.id,
                    email:user.email,
                    name : user.name
                }
                token = jwt.sign(payload,'123456')

                res.status(200).send({mytoken:token})
            }
        }
        
    }catch(error){
        res.status(400).send(error)
    }
})


router.get('/readall',async(req,res)=>{
    try{
        users =await User.find()
        res.send(users)
    }catch(error){
        res.send(error)
    }
});

router.get('/getById/:id',async(req,res)=>{
try{
    myid = req.params.id
    user = await User.findOne({_id :myid})
    res.send(user)
}catch(error){
    res.send(error);
}
});


router.delete('/delete/:id',async(req,res)=>{
    try{
        myid = req.params.id
        deletedUser = await User.findOneAndDelete({_id : myid})
        res.send("user with this id : "+myid+"  is deleted !")
    }catch(error){
        res.send(error)
    }
});


router.put('/update/:id',async(req,res)=>{
    try{
        myid = req.params.id
        dataUpdated = req.body;
        deletedUser = await User.findOneAndUpdate({_id : myid},dataUpdated)
        res.send("user with this id : "+myid+"  is updated !")
    }catch(error){
        res.send(error)
    }
});
router.put('/updatePass/:id', async (req, res) => {
    try {
        const myid = req.params.id;
        const { oldPassword, newPassword } = req.body;

        // Vérifier si les champs oldPassword et newPassword existent
        if (!oldPassword || !newPassword) {
            return res.status(400).send("Both oldPassword and newPassword fields are required");
        }

        
        const user = await User.findById(myid);
        if (!user) {
            return res.status(404).send("User not found");
        }

      
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).send("Incorrect old password");
        }

       
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        
        user.password = hashedPassword;
        user.confirmpassword = hashedPassword;
        await user.save();

        res.send("Password for user with this id : " + myid + " is updated !");
    } catch (error) {
        res.status(500).send(error);
    }
});


router.put('/updateadresse/:id', async (req, res) => {
    try {
        const myid = req.params.id;
        const { oldadresse, newadresse } = req.body;

        // Vérifier si les champs oldPassword et newPassword existent
        if (!oldadresse || !newadresse) {
            return res.status(400).send("Both oldPassword and newPassword fields are required");
        }

        
        const user = await User.findById(myid);
        if (!user) {
            return res.status(404).send("adresse not found");
        }
        user.adresse=newadresse;
        await user.save();

        res.send("adresse for user with this id : " + myid + " is updated !");
    } catch (error) {
        res.status(500).send(error);
    }
});
router.put('/add-to-favorites/:userId/:productId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const productId = req.params.productId;

    
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send("User not found");
        }

        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send("Product not found");
        }

       
        if (user.favorites.includes(productId)) {
            return res.status(400).send("Product already exists in favorites");
        }

       
        user.favorites.push(productId);
        await user.save();

        res.send("Product added to favorites successfully");
    } catch (error) {
        res.status(500).send(error);
    }
});

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Remplacer par votre serveur SMTP
    port: 465,
    secure: true, // Activation de la connexion sécurisée
    auth: {
      user: 'elyesmlik307@gmail.com', // Remplacer par votre adresse e-mail
      pass: 'kzds bqyj zjpa guin' // Remplacer par votre mot de passe
    }
  });


  router.post('/reset-password', async (req, res) => {
    const { email } = req.body; // Récupérer l'e-mail de la requête
  
    // Générer un nouveau mot de passe temporaire
    const newPassword = generateRandomPassword();
  
    // Mettre à jour le mot de passe de l'utilisateur dans la base de données
    // (remplacez cette partie par votre code de mise à jour de la base de données)
    await updateUserPassword(email, newPassword);
  
    // Préparer le contenu de l'e-mail
    const mailContent = {
      from: 'Emna',
      to: email,
      subject: 'Réinitialisation du mot de passe',
      text: `Votre nouveau mot de passe est : ${newPassword}\n\nVeuillez le modifier dès que vous vous connectez.`
    };
  
    // Envoyer l'e-mail de réinitialisation
    try {
      await transporter.sendMail(mailContent);
      res.json({ message: 'E-mail de réinitialisation envoyé avec succès.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Échec de l'envoi de l'e-mail de réinitialisation." });
    }
  });
  function generateRandomPassword() {
    const length = 10; // Longueur du mot de passe
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }
    return password;
  }
const MongoClient = require('mongodb').MongoClient;

async function updateUserPassword(email, newPassword) {
  const client = await MongoClient.connect('mongodb://localhost:27017'); 
  const db = client.db('ecommerce'); 
  const collection = db.collection('users');

  const user = await collection.findOne({ email });
  if (!user) {
    throw new Error('Utilisateur introuvable avec cet e-mail.');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await collection.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });

  await client.close();
}


module.exports = router;