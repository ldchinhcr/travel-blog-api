const Review = require("../models/review");
const Tour = require("../models/tour");
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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

exports.updateReview = catchAsync(async function (req, res, next) {
    const review = await Review.findById(req.params.rId);
    if (!review) {
      return next(new AppError('No category found with that ID', 404));
    }
    const user = await User.findById(req.user.id);
    if (review.createdBy.toString() === req.user.id.toString() || user.roles === 'admin' || user.roles === 'editor' ) {
      if (req.body) {
        const fields = Object.keys(req.body);
        fields.map((item) => (review[item] = req.body[item]));
        review.save();
        res
          .status(200)
          .json({ ok: true, message: "Review updated successfully" });
      }
    } else {
      res.status(401).json({ ok: false, err: "Unauthorized" });
    }
});

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

exports.deleteReview = catchAsync(async function (req, res, next) {
    const review = await Review.findById(req.params.rId);
    const user = await User.findById(req.user.id);
    if (review.createdBy.toString() === req.user.id.toString() || user.roles === 'admin' || user.roles === 'editor' ) {
      const delReview = await Review.findByIdAndDelete(req.params.rId);
      if (!delReview) {
        return next(new AppError('No review found with that ID', 404));
      }
      res.status(204).json();
    } else {
      res.status(401).json({ ok: false, message: "Unauthorized" });
    }
});
