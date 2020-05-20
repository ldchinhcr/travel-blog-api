const Cat = require("../models/category");
const User = require("../models/user");
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const {updateOne, deleteOne, createOne} = require('../utils/operateHandler');

exports.createCat = createOne(Cat);

exports.getCats = catchAsync( async function (req, res, next) {
  const cats = await Cat.find();
  if (cats.length === 0) {
    return next(new AppError('No categories found', 404));
  }
  res.status(200).json({ status: true, categories: cats });
});

exports.getSingleCat = catchAsync( async function (req, res, next) {
  const cat = await Cat.findById(req.params.cId)
  if (!cat) {
  return next(new AppError('No category found with that ID', 404));
}
res.status(200).json({ status: true, cat: cat });
});

exports.deleteCat = deleteOne(Cat);

exports.updateCat = updateOne(Cat);
