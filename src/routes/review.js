const {getReviews, getReview, createReview, updateReview, deleteReview} = require('../controllers/reviewController');
const {validateCat, validateTour, validateReview} = require('../utils/validate');
const {auth} = require('../controllers/authController');

const express = require('express');
const app = express();
const router = express.Router({mergeParams: true});
app.use(router);

router.route('/')
.get(validateCat, validateTour, getReviews)
.post(auth, validateCat, validateTour, createReview);

router.route('/:rId')
.get(validateCat, validateTour, getReview)
.put(auth, validateCat, validateTour, validateReview, updateReview)
.delete(auth, validateCat, validateTour, validateReview, deleteReview);

module.exports = router;
