const Tour = require('../models/tour');
const Cat = require('../models/category');
const User = require('../models/user');
const APIFeatures = require('../utils/apiFeatures');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name, price, ratingsAverage, summary, difficulty';
  next();
};

exports.createTour = async function (req, res) {
  req.body.category = req.cat._id;
  req.body.createdBy = req.user.id;
  try {
    const tour = await Tour.create(req.body);
    res.status(201).json({ ok: true, tour: tour });
  } catch (err) {
    res.status(500).json({ ok: false, err: err.message });
  }
};

exports.updateTour = async function (req, res) {
  try {
    const tour = await Tour.findById(req.params.tId);
    const user = await User.findById(req.user.id);
    if (
      tour.createdBy.toString() === req.user.id.toString() ||
      user.roles === 'admin' ||
      user.roles === 'editor'
    ) {
      delete req.user;
      delete req.cat;
      delete req.tour;
      if (req.body) {
        const fields = Object.keys(req.body);
        fields.map((item) => (tour[item] = req.body[item]));
        tour.save();
        res
          .status(200)
          .json({ ok: true, message: 'Tour updated successfully' });
      }
    } else {
      res.status(401).json({ ok: false, err: 'Unauthorized' });
    }
  } catch (err) {
    res.status(500).json({ ok: false, err: err.message });
  }
};

exports.getTour = async function (req, res) {
  try {
    // const tour = await Tour.find({category: req.cat._id})
    // .populate("createdBy", "_id email name")
    // .populate({
    //     path: "category",
    //     select: "-createdAt -updatedAt -__v"
    // })
    const cat = await Cat.findById(req.cat._id).populate({
      path: 'tours',
      select: '-createdAt -updatedAt -__v -createdBy -id',
    });
    res
      .status(200)
      .json({ ok: true, tour: cat, tours_length: cat.tours.length });
  } catch (err) {
    res.status(500).json({ ok: false, err: err.message });
  }
};

exports.filteredTours = async function (req, res) {
  try {
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tour = await features.query;
    res.status(200).json({ ok: true, tour: tour, tours_length: tour.length });
  } catch (err) {
    res.status(500).json({ ok: false, err: err.message });
  }
};

exports.getSingleTour = async function (req, res) {
  try {
    const tour = await Tour.find({ _id: req.params.tId })
      .populate('createdBy', '_id email name')
      .populate({
        path: 'category',
        select: '-createdAt -updatedAt -__v',
      });
    if (tour.length === 0)
      return res.status(404).json({ ok: false, err: 'Tour id not exist' });
    res.status(200).json({ ok: true, tour: tour });
  } catch (err) {
    res.status(500).json({ ok: false, err: err.message });
  }
};

exports.deleteTour = async function (req, res) {
  try {
    const tour = await Tour.findById(req.params.tId);
    const user = await User.findById(req.user.id);
    if (
      tour.createdBy.toString() === req.user.id.toString() ||
      user.roles === 'admin' ||
      user.roles === 'editor'
    ) {
      await Tour.findByIdAndDelete(req.params.tId);
      res.status(204).json();
    } else {
      res.status(401).json({ ok: false, message: 'Unauthorized' });
    }
  } catch (err) {
    res.status(400).json({ ok: false, message: err.message });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          num: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
      // {
      //   $match: { _id: {$ne: 'EASY'}}
      // }
    ]);
    res.status(200).json({ ok: true, stats: stats });
  } catch (err) {
    res.status(404).json({ ok: false, err: err.message });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' }
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: {
          _id: 0
        }
      },
      {
        $sort: { numTourStarts: -1 }
      },
      {
        $limit: 6
      },
    ]);
    res.status(200).json({ ok: true, plan: plan });
  } catch (err) {
    res.status(404).json({ ok: false, err: err.message });
  }
};
