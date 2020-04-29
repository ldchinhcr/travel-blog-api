require('dotenv').config({path: '.env'})

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 🎆 Shutting down ...')
  console.log(err.name, err.message);
  process.exit(1);
});

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const AppError = require('./src/utils/appError');
const globalErrorHandler = require('./src/controllers/errorController')
const toursRoute = require('./src/routes/tours');
const usersRoute = require('./src/routes/users');


mongoose.connect(process.env.MONGODB_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log("Successfully connected to database!"))

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/tours/api', toursRoute);
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

