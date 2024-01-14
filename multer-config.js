const multer = require('multer');

// Types MIME autorisés avec leurs extensions correspondantes
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// Configuration du stockage pour multer
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    // Définition du répertoire de destination des fichiers téléchargés
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    // Génération du nom de fichier avec une modification du nom original
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name);
  }
});

module.exports = multer({ storage: storage }).single('image');