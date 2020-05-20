const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const {updateOne, createOne} = require('../utils/operateHandler');
const verifyHTMLForm = require('../assets/verify');


exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate(
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
  res.status(200).json({ status: true, data: users})
})

exports.createUser = createOne(User);

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
  if (req.user.roles === 'admin') {
    const user = await User.findByIdAndUpdate(req.params.id, { roles: 'admin' });
    if (!user) {
      return next(new AppError('No User with that such ID!', 404));
    }
    res
      .status(200)
      .json({ ok: true, message: "User's roles updated successfully." });
  } else {
    return next(new AppError('Unauthorized to perform this action', 403));
  }
});

exports.forgotPassword = catchAsync(async function (req, res, next) {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email address.', 404));
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${process.env.CLIENT_DOMAIN}/resetpassword/?resettoken=${resetToken}`;
  const msg = `Forgot your password? Submit with your new password and passwordConfirm to the link below. If you didn't forget your password, please ignore this email!`;
  const namebutton = 'Reset Password';
  const html = verifyHTMLForm(msg, namebutton, resetURL);
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset Token (valid for 10 mins)',
      html,
    });

    res.status(200).json({
      status: true,
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(err.message)
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
    .update(req.body.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  
  user.token = [];
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save();
  

  const link = `${process.env.CLIENT_DOMAIN}/login`;;
  const msg = `Here your new password: ${req.body.password}.\n Please login again to change your password`;
  const namebutton = 'Login';
  const html = verifyHTMLForm(msg, namebutton, link);
  
  res.status(200).json({
    status: true,
    message: 'Password had been set successfully. An email with your new password has been sent to your email address.'
  })
  
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your new password',
      html,
    });

  } catch (err) {
    return next(
      new AppError(
        'There was an error when trying to send the email!',
        500
      )
    );
  }
});

exports.verifyAccount = catchAsync(async function (req, res, next) {
  const hashedToken = crypto
  .createHash('sha256')
  .update(req.body.token)
  .digest('hex');

  const user = await User.findOne({
    verifyToken: hashedToken,
    verifyExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Verified token is invalid or has expired', 400));
  }

  user.verified = true;
  user.verifyExpires = undefined;
  user.verifyToken = undefined;
  await user.save({ validateBeforeSave: false});

  const link = `${process.env.CLIENT_DOMAIN}/login`;;
  const msg = `Your account has been verified.\n Please login to start explore our service!`;
  const namebutton = 'Login';
  const html = verifyHTMLForm(msg, namebutton, link);
  
  res.status(200).json({
    status: true,
    message: 'Account has been verified!.'
  })
  
  try {
    await sendEmail({
      email: user.email,
      subject: 'Account has been verified',
      html,
    });

  } catch (err) {
    return next(
      new AppError(
        'There was an error when trying to send the email!',
        500
      )
    );
  }
})

exports.setUserInactive = catchAsync(async function (req, res, next) {
  if (req.user.id === req.params.id || req.user.roles === 'admin') {
    await User.findByIdAndUpdate(req.params.id, {active: false})
    res.status(204).end();
  } else {
    return next(new AppError('You not have permissions to perform this action.', 403));
  }
});
