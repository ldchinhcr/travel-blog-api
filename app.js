require('dotenv').config({path: '.env'})
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const toursRoute = require('./src/routes/tours');
const usersRoute = require('./src/routes/users')


mongoose.connect(process.env.MONGODB_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log("Successfully connected to database!"))
  .catch((err) => console.log(err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/tours/api', toursRoute);
app.use('/users', usersRoute);

app.get("/", async(req, res) => {
    return res.status(200).json({ status: true, message: 'Connection established' });
  });


app.listen(process.env.PORT, () => {
    console.log("App running on port ", process.env.PORT);
  });