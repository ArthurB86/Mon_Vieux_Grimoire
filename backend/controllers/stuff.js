const Book = require('../models/Book');
const fs = require('fs');

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
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    const book = new Book({
        ...bookObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    book.save()
        .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
        .catch(error => {console.log(error);
          res.status(400).json({ error })});
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
  Book.findOne({ _id: req.params.id })
    .then(book => {
      // Vérifier si l'utilisateur est autorisé à supprimer ce livre
      if (book.userId !== req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
      } else {
        // Supprimer l'image associée et ensuite supprimer le livre
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
            .catch(error => res.status(401).json({ error }));
        });
      }
    })
    .catch(error => {
      res.status(500).json({ error });
    });
};

