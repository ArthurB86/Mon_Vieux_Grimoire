const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const stuffRoutes = require("./routes/stuff");
const userRoutes = require("./routes/user");
require('dotenv').config();

const mongoDBURL = process.env.MONGODB_URL;
const secretKey = process.env.SECRET_KEY;

mongoose.connect(mongoDBURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((error) => console.error('Connexion à MongoDB échouée !', error));

app.use((req, res, next) => {
    // Configuration des en-têtes CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(express.json());
app.use('/api/books', stuffRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;