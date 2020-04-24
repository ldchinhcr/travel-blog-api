const Review = require("../models/review");
const Tour = require("../models/tour");

exports.createReview = async function (req, res) {
  try {
    const review = await Review.create({
      tour: req.tour._id,
      content: req.body.content,
      rating: req.body.rating,
      category: req.cat._id,
      createdBy: req.user.id,
    });
    res.status(201).json({ ok: true, review: review });
  } catch (err) {
    res.status(500).json({ ok: false, err: err.message });
  }
};

exports.updateReview = async function (req, res) {
  try {
    const review = await Review.findById(req.params.rId);
    const user = await User.findById(req.user.id);
    if (review.createdBy.toString() === req.user.id.toString() || user.roles === 'admin' || user.roles === 'editor' ) {
      delete req.user;
      delete req.cat;
      delete req.tour;
      delete req.review;
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
  } catch (err) {
    res.status(500).json({ ok: false, err: err.message });
  }
};

exports.getReviews = async function (req, res) {
  try {
    const tour = await Tour.find(req.tour._id)
      .populate({
        path: "reviews",
        select: "-createdAt -updatedAt -__v -createdBy -category",
      })
      .populate("category", "title description")
      .populate("createdBy", "_id email name");
    res.status(200).json({ ok: true, tour: tour });
  } catch (err) {
    res.status(500).json({ ok: false, err: err.message });
  }
};

exports.getReview = async function (req, res) {
  try {
    const review = await Review.find({ _id: req.params.rId })
      .populate("tour", "_id title description")
      .populate("createdBy", "_id email name")
      .populate({
        path: "category",
        select: "-createdAt -updatedAt -__v",
      });
    if (review.length === 0)
      return res.status(404).json({ ok: false, err: "Review Id not exist" });
    res.status(200).json({ ok: true, review: review });
  } catch (err) {
    res.status(500).json({ ok: false, err: err.message });
  }
};

exports.deleteReview = async function (req, res) {
  try {
    const review = await Review.findById(req.params.rId);
    const user = await User.findById(req.user.id);
    if (review.createdBy.toString() === req.user.id.toString() || user.roles === 'admin' || user.roles === 'editor' ) {
      await Review.findByIdAndDelete(req.params.rId);
      res.status(204).json();
    } else {
      res.status(401).json({ ok: false, message: "Unauthorized" });
    }
  } catch (err) {
    res.status(400).json({ ok: false, message: err.message });
  }
};
