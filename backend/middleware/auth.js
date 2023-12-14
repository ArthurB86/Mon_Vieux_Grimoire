const jwt = require('jsonwebtoken');
require('dotenv').config(); // Chargez les variables d'environnement depuis le fichier .env

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decodedToken.userId;
        req.auth = {
            userId: userId
        };
        next();
    } catch (error) {
        res.status(401).json({ error: 'Authentication failed' });
    }
};