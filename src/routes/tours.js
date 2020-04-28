const {auth, timeOut} = require('../controllers/authController');
const {createCat, getCats, getSingleCat, deleteCat, updateCat} = require('../controllers/catController');
const {getTourStats, getMonthlyPlan, aliasTopTours, filteredTours, getTour, getSingleTour, createTour, updateTour, deleteTour} = require('../controllers/tourController');
const {getReviews, getReview, createReview, updateReview, deleteReview} = require('../controllers/reviewController');
const {roleCheck, validateCat, validateTour, validateReview} = require('../utils/validate');
const express = require('express');
const app = express();

const router = express.Router();
app.use(router);

router.get('/top-5-cheap', aliasTopTours, filteredTours)

router.get('/tour-stats', getTourStats)

router.get('/monthly-plan/:year', getMonthlyPlan)

router.route('/search')
.get(filteredTours)

// category
router.route('/cat/:cId')
.get(getSingleCat)
.delete(auth, timeOut, roleCheck, deleteCat)
.put(auth, timeOut, roleCheck, updateCat)

router.route('/cat')
.get(getCats)
.post(auth, timeOut, createCat)

//tour
router.route('/cat/:cId/tour')
.get(validateCat, getTour)
.post(auth, timeOut, validateCat, createTour)

router.route('/cat/:cId/tour/:tId')
.get(validateCat, getSingleTour)
.put(auth, timeOut, validateCat, validateTour, updateTour)
.delete(auth, timeOut, validateCat, validateTour, deleteTour)

//reviews
router.route('/cat/:cId/tour/:tId/reviews')
.get(validateCat, validateTour, getReviews)
.post(auth, timeOut, validateCat, validateTour, createReview)

router.route('/cat/:cId/tour/:tId/reviews/:rId')
.get(validateCat, validateTour, getReview)
.put(auth, timeOut, validateCat, validateTour, validateReview, updateReview)
.delete(auth, timeOut, validateCat, validateTour, validateReview, deleteReview)


module.exports = router;