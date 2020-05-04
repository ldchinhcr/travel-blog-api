const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const {updateOne} = require('../utils/operateHandler');


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

exports.allUser = catchAsync(async function (req, res, next) {
  const users = await User.find().populate('userTours', '_id title description');
  console.log(users)
  res.status(200).json({ ok: true, data: users})
})

exports.createUser = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);
  if (!user) {
    return next(new AppError('Create user failed', 400));
  }
  res.status(201).json({ status: true, data: user });
});

exports.updatePasswords = catchAsync(async function (req, res, next) {
  const user = await User.findById(req.params.id).select('+password');
  if (!user) {
    return next(new AppError('No User with that such ID!', 404));
  }
  if (req.body) {
    const verifiedPassword = await bcrypt.compare(req.body.currentPassword.toString(), user.password);
    if (!verifiedPassword) {
      return next(new AppError('Invalid current password', 400));
    }
    user.token = [];
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    const verified = await user.save();
    if (!verified) {
      return next(new AppError('Something went wrong! Check again please!', 500));
    }
    res.status(200).json({
      ok: true,
      message: 'User updated successfully. Please login again.',
    });
  } else {
    return next(new AppError('Please provide some information to change your account', 400))
  }
});

exports.updateProfile = updateOne(User);

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

exports.setUserInactive = catchAsync(async function (req, res, next) {
  if (req.user.id === req.params.id) {
    await User.findByIdAndUpdate(req.params.id, {active: false})
    res.status(204).end();
  } else {
    return next(new AppError('You not have permissions to perform this action.', 403));
  }
});
