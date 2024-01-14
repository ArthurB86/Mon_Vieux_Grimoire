const jwt = require('jsonwebtoken');

// Chargement des variables d'environnement depuis le fichier .env
require('dotenv').config();

// Middleware d'authentification
module.exports = (req, res, next) => {
    try {
        // Extraction du token de l'en-tête Authorization de la requête
        const token = req.headers.authorization.split(' ')[1];

        // Vérification et décodage du token avec la clé secrète
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY);

        // Extraction de l'ID de l'utilisateur à partir du token décodé
        const userId = decodedToken.userId;

        // Ajout de l'ID de l'utilisateur à l'objet req pour qu'il soit accessible dans les routes suivantes
        req.auth = {
            userId: userId
        };
        next();
    } catch (error) {
        res.status(401).json({ error: 'Authentication failed' });
    }
};