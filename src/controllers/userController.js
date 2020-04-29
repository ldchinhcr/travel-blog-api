const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getUser = catchAsync( async (req, res, next) => {
  const user = await User.findById(req.params.id).populate(
    'userTours',
    '_id title description'
  );
  if (!user) {
    return next(new AppError('No User with that such ID!', 404));
  }
  res.status(200).json({ status: true, data: user });
});

exports.createUser = catchAsync(async (req, res, next) => {
    const user = await User.create(req.body);
    if (!user) {
      return next(new AppError('Create user failed', 400));
    }
    res.status(201).json({ status: true, data: user });
});

exports.updateUser = catchAsync(async function (req, res, next) {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('No User with that such ID!', 404));
  }
  if (req.body) {
    req.body.token = [];
    req.body.email = req.body.email.toLowerCase();
    const fields = Object.keys(req.body);
    fields.map((item) => (user[item] = req.body[item]));
    const verified = await user.save();
    if (!verified) {
      return next(new AppError('Something went wrong!', 400));
    }
    res
      .status(200)
      .json({
        ok: true,
        message: 'User updated successfully. Please login again.',
      });
  }
});

exports.changeRolesAdmin = catchAsync(async function (req, res, next) {
  const user = await User.findByIdAndUpdate(req.user.id, { roles: 'admin' });
  if (!user) {
    return next(new AppError('No User with that such ID!', 404));
  }
  res
    .status(200)
    .json({ ok: true, message: "User's roles updated successfully." });
});
