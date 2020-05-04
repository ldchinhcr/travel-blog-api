require('dotenv').config({path: '.env'})

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 🎆 Shutting down ...')
  console.log(err.name, err.message);
  process.exit(1);
});

const rateLimit = require('express-rate-limit');
const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./src/utils/appError');
const globalErrorHandler = require('./src/controllers/errorController')
const toursRoute = require('./src/routes/tours');
const usersRoute = require('./src/routes/users');
const catsRoute = require('./src/routes/cat');
const reviewsRoute = require('./src/routes/review.js');

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
})
const limiterUsers = rateLimit({
  max: 5,
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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '10kb'}));

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

app.use('/cat/:cId/tours/:tId/reviews', reviewsRoute);
app.use('/cat/:cId/tours/', toursRoute);
app.use('/cat', catsRoute);
app.use('/users', usersRoute);


app.get("/", async(req, res) => {
    return res.status(200).json({ status: true, message: 'Connection established' });
  });

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
})

app.use(globalErrorHandler)

const server = app.listen(process.env.PORT, () => {
    console.log("App running on port ", process.env.PORT);
  });

process.on('unhandledRejection', err => {
  console.log('UNHANDLER REJECTION! 🎆 Shutting down ...')
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

