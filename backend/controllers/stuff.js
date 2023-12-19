const Book = require('../models/Book');
const fs = require('fs');
const sharp = require('sharp')

// Récupérer tous les livres
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then(books => {
      res.status(200).json(books);
    })
    .catch(error => {
      res.status(400).json({
        error: error
      });
    });
};

// Récupérer les trois livres les mieux notés
exports.getBestRatingBooks = (req, res, next) => {
  Book.find().sort({ averageRating: -1 }).limit(3)
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

// Créer un livre
exports.createBook = (req, res, next) => {
  console.log("createBook");

  // Analyser les données du livre à partir du corps de la requête
  const bookObject = JSON.parse(req.body.book);

  // Supprimer le champ _id pour garantir la génération d'un nouvel ID par MongoDB
  delete bookObject._id;

  // Créer une nouvelle instance de livre avec les données analysées
  const book = new Book({
    ...bookObject
  });

  // Vérifier si un fichier image est attaché à la requête
  if (req.file) {
    // Utiliser Sharp pour traiter l'image
    const imagePath = `${req.file.destination}/${req.file.filename}`;
    const outputImagePath = `${req.file.destination}/resized-${req.file.filename}`;

    sharp(imagePath)
      .resize({ width: 800 }) // Ajuster les options de redimensionnement selon les besoins
      .toFile(outputImagePath, (err) => {
        if (err) {
          console.error(`Erreur de traitement de l'image : ${err.message}`);
          return res.status(400).json({ error: 'Erreur de traitement de l\'image' });
        }

        // Ajouter l'URL de l'image traitée à l'objet livre
        book.imageUrl = `${req.protocol}://${req.get('host')}/images/resized-${req.file.filename}`;

        // Enregistrer le livre dans la base de données
        book.save()
          .then(() => {
            // Supprimer le fichier image original
            fs.unlinkSync(imagePath);

            // Répondre avec un message de succès
            res.status(201).json({ message: 'Objet enregistré !' });
          })
          .catch(error => {
            console.log(error);
            res.status(400).json({ error });
          });
      });
  } else {
    // Enregistrer le livre dans la base de données sans traiter d'image
    book.save()
      .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
      .catch(error => {
        console.log(error);
        res.status(400).json({ error });
      });
  }
};


// Noter un livre
exports.ratingBooks = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      // Vérifier si l'utilisateur a déjà noté ce livre et si la note est valide
      if (book.ratings.some(rating => rating.userId === req.userId) || (req.body.grade < 1 || req.body.grade > 5)) {
        res.status(500).json({ error: 'Erreur lors de la notation' });
      } else {
        // Ajouter la nouvelle évaluation et calculer la nouvelle moyenne des notes
        book.ratings.push({
          userId: req.body.userId,
          grade: req.body.rating
        });
        const totalRatings = book.ratings.length;
        const sumOfRatings = book.ratings.reduce((acc, rating) => acc + rating.grade, 0);
        book.averageRating = sumOfRatings / totalRatings;
        book.averageRating = parseFloat(book.averageRating.toFixed(1));
        // Sauvegarder le livre mis à jour
        book.save()
          .then(book => {
            res.status(200).json(book);
          })
          .catch(error => res.status(500).json({ error }));
      }
    })
    .catch(error => res.status(404).json({ error }));
};


// Récupérer un livre par son identifiant
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      res.status(200).json(book);
    })
    .catch(error => {
      res.status(404).json({
        error: error,
      });
    });
};

// Modifier un livre
exports.modifyBook = (req, res, next) => {
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete bookObject._userId;

  // Vérifier si l'utilisateur est autorisé à modifier ce livre
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId !== req.auth.userId) {
        res.status(403).json({ message: 'Unauthorized request' });
      } else {
        // Mettre à jour les informations du livre
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet modifié!' }))
          .catch(error => res.status(401).json({ error }));
      }
    })
    .catch(error => {
      res.status(400).json({ error });
    });
};

// Supprimer un livre
exports.deleteBook = (req, res, next) => {
  // Rechercher le livre à supprimer par son ID
  Book.findOne({ _id: req.params.id })
    .then(book => {
      // Vérifier si l'utilisateur est autorisé à supprimer ce livre
      if (book.userId !== req.auth.userId) {
        res.status(401).json({ message: 'Non autorisé' });
      } else {
        // Récupérer le nom du fichier image associé
        const filename = book.imageUrl.split('/images/')[1];

        // Supprimer le fichier image associé
        fs.unlink(`images/${filename}`, () => {
          // Supprimer le livre de la base de données
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: 'Objet supprimé !' });
            })
            .catch(error => {
              res.status(401).json({ error });
            });
        });
      }
    })
    .catch(error => {
      res.status(500).json({ error });
    });
};

