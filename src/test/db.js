const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userForTestId = new mongoose.Types.ObjectId();
const userForTest = {
  _id: userForTestId,
  name: {
    first: 'Chinh',
    last: 'D. Le',
  },
  password: 123456789,
  passwordConfirm: 123456789,
  email: 'ldchinh@gmail.com',
  token: [jwt.sign({ id: userForTestId }, process.env.SECRET_KEY)],
};

const catId = new mongoose.Types.ObjectId();
const catForTest = {
  _id: catId,
  cat: 'North America',
  description: "It's big region with 2 big countries.",
};

const tourId = new mongoose.Types.ObjectId();
const tourForTest = {
  _id: tourId,
  name: 'The Northern Lights',
  duration: 3,
  maxGroupSize: 12,
  difficulty: 'easy',
  ratingsAverage: 4.9,
  ratingsQuantity: 33,
  price: 1497,
  summary: 'Enjoy the Northern Lights in one of the best places in the world',
  description:
    'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum!\nDolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur, exercitation ullamco laboris nisi ut aliquip. Lorem ipsum dolor sit amet, consectetur adipisicing elit!',
  imageCover: 'tour-9-cover.jpg',
  images: ['tour-9-1.jpg', 'tour-9-2.jpg', 'tour-9-3.jpg'],
  startDates: ['2021-12-16,10:00', '2022-01-16,10:00', '2022-12-12,10:00'],
};

module.exports = { userForTest, userForTestId, catForTest, catId, tourId, tourForTest };
