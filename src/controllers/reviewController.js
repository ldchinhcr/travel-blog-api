const Review = require("../models/review");
const Tour = require("../models/tour");
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const {updateOne, deleteOne} = require('../utils/operateHandler');

exports.createReview = catchAsync( async function (req, res, next) {
    const review = await Review.create({
      tour: req.tour._id,
      content: req.body.content,
      rating: req.body.rating,
      category: req.cat._id,
      createdBy: req.user.id,
    });
    if (!review) {
      return next(new AppError('Create review failed', 500));
    }
    res.status(201).json({ ok: true, review: review });
});

exports.updateReview = updateOne(Review);

exports.getReviews = catchAsync(async function (req, res, next) {
    const tour = await Tour.findById(req.tour._id)
      .populate({
        path: "reviews",
        select: "-createdAt -updatedAt -__v -createdBy -category",
      })
      .populate("category", "title description")
      .populate("createdBy", "_id email name");
      if (!tour) {
        return next(new AppError('No tour or reviews found with that ID', 404));
      }
    res.status(200).json({ ok: true, tour: tour , reviews_length: tour.reviews.length});
});

exports.getReview = catchAsync(async function (req, res, next) {
    const review = await Review.findById(req.params.rId)
      .populate("tour", "_id title description")
      .populate("createdBy", "_id email name")
      .populate({
        path: "category",
        select: "-createdAt -updatedAt -__v",
      });
      if (!review) {
        return next(new AppError('No review found with that ID', 404));
      }
    res.status(200).json({ ok: true, review: review });
});

exports.deleteReview = deleteOne(Review);
