const crypto = require('crypto');
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

exports.getUser = catchAsync(async (req, res, next) => {
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
      return next(new AppError('Something went wrong!', 500));
    }
    res.status(200).json({
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

exports.forgotPassword = catchAsync(async function (req, res, next) {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email address.', 404));
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PUT request with your new password and passwordConfirm to: ${resetURL}.\n If you didn't forget your password, please ignore this email!`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset Token (valid for 10 mins)',
      message,
    });

    res.status(200).json({
      ok: true,
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error when trying to send the email. Try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async function (req, res, next) {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save();

  res.status(200).json({ 
    ok: true,
    message: 'Password had been set successfully.'
  })
});
