const {auth  } = require('../controllers/authController');
const {getTourStats, getMonthlyPlan, aliasTopTours, filteredTours, getTour, getSingleTour, createTour, updateTour, deleteTour} = require('../controllers/tourController');
const {validateCat, validateTour} = require('../utils/validate');
const express = require('express');
const app = express();

const router = express.Router({mergeParams: true});
app.use(router);


router.route('/search')
.get(filteredTours);

router.route('/:tId')
.get(validateCat, getSingleTour)
.put(auth, validateCat, validateTour, updateTour)
.delete(auth, validateCat, validateTour, deleteTour);

router.get('/top-5-cheap', aliasTopTours, filteredTours);

router.get('/tour-stats', getTourStats);

router.get('/monthly-plan/:year', getMonthlyPlan);

router.route('/')
.get(validateCat, getTour)
.post(auth, validateCat, createTour);

module.exports = router;