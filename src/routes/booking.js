const router = require('express').Router({mergeParams: true});

const {createBooking} = require('../controllers/bookingController');
const {auth} = require('../controllers/authController');
const {validateTour} = require('../utils/validate');


router.route('/')
.post(auth, validateTour, createBooking)

module.exports = router;