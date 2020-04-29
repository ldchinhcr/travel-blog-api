const Cat = require("../models/category");
const User = require("../models/user");
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getCats = catchAsync( async function (req, res, next) {
  const cats = await Cat.find();
  if (cats.length === 0) {
    return next(new AppError('No categories found', 404));
  }
  res.status(200).json({ ok: true, categories: cats });
});

exports.createCat = catchAsync( async function (req, res) {
  const { cat, description } = req.body;
    const category = await Cat.create({ cat, description });
    if (!category) {
      return next(new AppError('Create category failed', 500));
    }
    res.status(201).json({ ok: true, category: category });
});

exports.getSingleCat = catchAsync( async function (req, res, next) {
  const cat = await Cat.findById(req.params.cId).populate({
    path: "tours",
    select: "-createdAt -updatedAt -__v -createdBy -id",
  });
  if (!cat) {
  return next(new AppError('No category found with that ID', 404));
}
res.status(200).json({ ok: true, cat: cat });
});

exports.deleteCat = catchAsync( async function (req, res, next) {
  const user = await User.findById(req.user.id);
  if (user.roles === 'admin') {
    const cat = await Cat.findByIdAndDelete(req.params.cId);
    if (!cat) {
          return next(new AppError('No category found with that ID', 404));
    }
    res.status(204).json();
};
});

exports.updateCat = catchAsync( async function(req, res, next) {
    const cat = await Cat.findById(req.params.cId);
    if (!cat) {
      return next(new AppError('No category found with that ID', 404));
    }
    const user = await User.findById(req.user.id)
    if (user.roles === 'admin') {
    delete req.user
    if (req.body) {
    const fields = Object.keys(req.body);
    fields.map(item => cat[item] = req.body[item])
    cat.save();
    res.status(204).json({ok: true, message: 'Category updated successfully'})
}
} else {
  res.status(401).json({ok: false, error: 'Unauthorized'});
}
});
