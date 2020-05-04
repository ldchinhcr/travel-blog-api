const Tour = require('../models/tour');
const Cat = require('../models/category');
const User = require('../models/user');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const {updateOne, deleteOne} = require('../utils/operateHandler');



exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name, price, ratingsAverage, summary, difficulty';
  next();
};

exports.createTour = catchAsync(async function (req, res) {
  req.body.category = req.cat._id;
  req.body.createdBy = req.user.id;
    const tour = await Tour.create(req.body);
    if (!tour) {
      return next(new AppError('Create tour failed', 500));
    }
    res.status(201).json({ ok: true, tour: tour });
});

exports.updateTour = updateOne(Tour);

exports.getTour = catchAsync(async function (req, res, next) {
    const cat = await Cat.findById(req.cat._id).populate({
      path: 'tours',
      select: '-createdAt -updatedAt -__v -createdBy -id',
    });
    if (!cat) {
      return next(new AppError('No tours found with that category ID', 404));
    }
    res
      .status(200)
      .json({ ok: true, tour: cat, tours_length: cat.tours.length });
});

exports.filteredTours = catchAsync(async function (req, res) {
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tour = await features.query;
    res.status(200).json({ ok: true, tour: tour, tours_length: tour.length });
});

exports.getSingleTour = catchAsync(async function (req, res, next) {
    const tour = await Tour.findById(req.params.tId)
      .populate('createdBy', '_id email name')
      .populate({
        path: 'category',
        select: '-createdAt -updatedAt -__v',
      });
      if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
      }
    res.status(200).json({ ok: true, tour: tour });
});

exports.deleteTour = deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res) => {
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
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
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
});
