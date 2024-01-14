const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const stuffCtrl = require('../controllers/book');




router.get('/', stuffCtrl.getAllBooks);
router.get('/bestrating', stuffCtrl.getBestRatingBooks);
router.post('/', auth, multer, stuffCtrl.createBook);
router.get('/:id', stuffCtrl.getOneBook);
router.put('/:id', auth, multer, stuffCtrl.modifyBook);
router.delete('/:id', auth, stuffCtrl.deleteBook);
router.post('/:id/rating', auth, stuffCtrl.ratingBooks);

module.exports = router;