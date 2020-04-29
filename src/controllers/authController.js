const User = require("../models/user");
const jwt = require("jsonwebtoken");
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.login = catchAsync(async function (req, res, next) {
    const { email, password } = req.body;
    const user = await User.loginWithCredentials(email, password);
    const token = await User.generateToken(user);
    user.token.push(token)
    await User.findByIdAndUpdate(user._id, {token: user.token})
    res.status(200).json({ ok: true, token: token });
});

exports.logout = catchAsync(async function (req, res) {
      const { email } = req.user;
      const token = req.headers.authorization.replace("Bearer ", "");
      const user = await User.findOne({ email });
      user.token = user.token.filter((id) => id !== token);
      await User.findByIdAndUpdate(user._id, {token: user.token})
      res.status(204).json({ status: true, message: "Logout successful" });
  });
  

exports.logoutall = catchAsync(async function (req, res) {
      const { email } = req.user;
      const user = await User.findOne({ email });
      await User.findByIdAndUpdate(user._id, {token: []})
      res.status(204).json({ status: true, message: "Logout successful" });
  });

exports.auth = catchAsync(async function (req, res, next) {
  if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) return res.status(403).json({ ok: false, message: "Token is required" });
  const token = req.headers.authorization.replace("Bearer ", "");
  if (token) {
      const tokenJson = jwt.verify(token, process.env.SECRET_KEY);
      const user = await User.findOne({email: tokenJson.email, _id: tokenJson.id, name: tokenJson.name});
      if (user) {
      req.user = tokenJson;
      next()
    } else {
      return next(new AppError('User not found!', 404));
    }
  } else {
    return next(new AppError('Token is required!', 403));
  }
});

exports.timeOut = catchAsync(async function (req, res, next) {
    const current = Math.floor(Date.now() / 1000);
    const expTime = req.user.exp
    if (current <= expTime) {
      delete req.user.exp
      delete req.user.iat
      next();
    } else {
        const { email } = req.user;
        const authorization = req.headers.authorization.replace("Bearer ", "");
        const user = await User.findOne({ email });
        user.token = user.token.filter((id) => id !== authorization);
        await User.findByIdAndUpdate(user._id, {token: user.token})
        return res.status(401).json({ status: false, message: "Expired Login" });
    }
  });
