const {auth} = require('../controllers/authController');
const {getSingleTour, createTour, updateTour, deleteTour, getTour} = require('../controllers/tourController');
const {validateTour} = require('../utils/validate');
const express = require('express');
const app = express();

const router = express.Router({mergeParams: true});
app.use(router);

router.route('/:tId')
.get(getSingleTour)
.put(auth, validateTour, updateTour)
.delete(auth, validateTour, deleteTour);

router.route('/')
.get(getTour)
.post(auth, createTour);

module.exports = router;