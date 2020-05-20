require('dotenv').config({path: '.env'})
const rateLimit = require('express-rate-limit');
const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const passport = require('./src/auth/passport');
const cors = require('cors');

const AppError = require('./src/utils/appError');
const globalErrorHandler = require('./src/controllers/errorController')
const toursRoute = require('./src/routes/tours');
const usersRoute = require('./src/routes/users');
const catsRoute = require('./src/routes/cat');
const bookingRoute = require('./src/routes/booking');
const reviewsRoute = require('./src/routes/review');
const statsRoute = require('./src/routes/stats');
const {getTour} = require('./src/controllers/tourController');

const limiter = rateLimit({
  max: 10000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
})
const limiterUsers = rateLimit({
  max: 10000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
})

const app = express();
app.use(helmet());

mongoose.connect(process.env.MONGODB_URI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true
})
.then(() => console.log("Successfully connected to database!"))

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '10kb'}));
app.use(passport.initialize());

app.use('/cat/', limiter);
app.use('/users/', limiterUsers);

app.use(mongoSanitize());

app.use(xss());

app.use(hpp({
  whitelist: [
    'duration',
    'ratingsQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'price'
  ]
}));

app.use('/tours/:tId/reviews', reviewsRoute);
app.use('/tours', toursRoute);
app.use('/tours/:tId/bookings', bookingRoute);
app.use('/cat', catsRoute);
app.use('/stats', statsRoute);
app.use('/users', usersRoute);


app.get("/", async(req, res) => {
    return res.status(200).json({ status: true, message: 'Connection established' });
  });

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
})

app.use(globalErrorHandler)


module.exports = app;
