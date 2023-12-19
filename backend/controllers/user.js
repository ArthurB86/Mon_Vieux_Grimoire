const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET_KEY = process.env.SECRET_KEY;

exports.signup = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validation des entrées
        if (!isValidEmail(email) || !isValidPassword(password)) {
            return res.status(400).json({ error: 'Adresse e-mail invalide ou mot de passe trop court.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            email: email,
            password: hashedPassword
        });

        await user.save();
        res.status(201).json({ message: 'Utilisateur créé !' });
    } catch (error) {
        res.status(500).json({ error: 'Une erreur s\'est produite lors de la création de l\'utilisateur.' });
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: 'Utilisateur non trouvé !' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET_KEY, { expiresIn: '24h' });

        res.status(200).json({
            userId: user._id,
            token: token,
        });
    } catch (error) {
        res.status(500).json({ error: 'Une erreur s\'est produite lors de la connexion.' });
    }
};

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPassword(password) {
    return password.length >= 8;
}