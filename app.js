require('dotenv').config({path: '.env'})
const express = require('express');
const router = express.Router();
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const {createUser, updateUser, getUser, changeRolesAdmin} = require('./src/controllers/userController');
const {login, auth, timeOut, logoutall, logout} = require('./src/controllers/authController');
const {createCat, getCats, getSingleCat, deleteCat, updateCat} = require('./src/controllers/catController');
const {getTour, getSingleTour, createTour, updateTour, deleteTour} = require('./src/controllers/tourController');
const {getReviews, getReview, createReview, updateReview, deleteReview} = require('./src/controllers/reviewController');
const {roleCheck, validateCat, validateTour, validateReview} = require('./src/utils/validate');



mongoose.connect(process.env.MONGODB_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Successfully connected to database!"))
  .catch((err) => console.log(err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(router);

// User controllers
router.route('/users')
.post(createUser)

router.route('/user/:id')
.get(getUser)
.put(auth, timeOut, updateUser)

router.put('/adminconfig', auth, timeOut, changeRolesAdmin)

router.post('/login', login)

router.get('/logout',auth, logout)

router.get('/logoutall',auth , logoutall)

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

router.get("/", async(req, res) => {
    return res.status(200).json({ status: true, message: 'Connection established' });
  });


app.listen(process.env.PORT, () => {
    console.log("App running on port ", process.env.PORT);
  });