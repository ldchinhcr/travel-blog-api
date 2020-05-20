const Tour = require('../models/tour');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const {updateOne, deleteOne, createOne} = require('../utils/operateHandler');



exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'price';
  req.query.fields = 'name, price, ratingsAverage, summary, difficulty';
  next();
};

exports.createTour = createOne(Tour);

exports.updateTour = updateOne(Tour);

exports.getTour = catchAsync(async function (req, res, next) {
  const features = new APIFeatures(Tour.find(), req.query)
  .filter()
  .sort()
  .limitFields()
  .paginate();
  const tours = await features.query;
  console.log(tours)
    if (tours.length === 0) {
      return next(new AppError("Nothing to show!", 404))
    }
    res.status(200).json({ status: true, tours: tours, tours_length: tours.length });
});

exports.getSingleTour = catchAsync(async function (req, res, next) {
    const tour = await Tour.findById(req.params.tId)
      .populate('createdBy', '_id email name')
      .populate({
        path: 'category',
        select: '-createdAt -updatedAt -__v',
      })
      .populate({
        path: 'reviews',
        select: '_id content rating'
      });
      if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
      }
    res.status(200).json({ status: true, tour: tour });
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
    res.status(200).json({ status: true, stats: stats });
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
    res.status(200).json({ status: true, plan: plan });
});
