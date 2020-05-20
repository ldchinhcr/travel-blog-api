const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Booking = require('../models/booking');
const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const Tour = require('../models/tour');

exports.createBooking = catchAsync(async function (req, res, next) {
  const { tId } = req.params;
  const { quantity, cc_number, cc_exp_month, cc_exp_year, cc_cvc } = req.body;
  if (!quantity) return next(new AppError('You must provide a quantity!', 400));
  const tour = await Tour.findById(tId);
  if (tour.availability < quantity) {
    return next(new AppError("You're booking exceeds the availability", 400));
  }
  const cardToken = await stripe.tokens.create({
    card: {
      number: cc_number,
      exp_month: cc_exp_month,
      exp_year: cc_exp_year,
      cvc: cc_cvc,
    },
  });

  const payment = await stripe.charges.create({
    amount: tour.price * quantity * 100,
    currency: 'usd',
    source: cardToken.id,
    description: `Payment for user ${req.user.name} for: Tour ${tour.title}`,
  });
  if (!payment.paid) {
    return next(
      new AppError('Sorry something went wrong during charge!!', 400)
    );
  }

  const booking = await Booking.create({
    user: req.user._id,
    tour: tId,
    quantity,
    total: quantity * tour.price,
    paymentID: payment.id,
    paid: true,
  });
  tour.availability = tour.availability - quantity;
  await tour.save();
  res.status(201).json({ status: true, data: booking });
});
