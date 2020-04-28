const User = require("../models/user");
const jwt = require("jsonwebtoken");

exports.login = async function (req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.loginWithCredentials(email, password);
    const token = await User.generateToken(user);
    res.status(200).json({ ok: true, token: token });
  } catch (err) {
    res.status(400).json({ ok: false, message: err.message });
  }
};

exports.logout = async function (req, res) {
    const { email } = req.user;
    try {
      const token = req.headers.authorization.replace("Bearer ", "");
      const user = await User.findOne({ email });
      user.token = user.token.filter((id) => id !== token);
      await user.save();
      res.status(204).json({ status: true, message: "Logout successful" });
    } catch (err) {
      res.status(401).json({ status: false, message: err.message });
    }
  };
  

exports.logoutall = async function (req, res) {
    const { email } = req.user;
    try {
      const user = await User.findOne({ email });
      user.token = [];
      await user.save();
      res.status(204).json({ status: true, message: "Logout successful" });
    } catch (err) {
      res.status(401).json({ status: false, message: err.message });
    }
  };

exports.auth = async function (req, res, next) {
  if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) return res.status(403).json({ ok: false, message: "Token is required" });
  const token = req.headers.authorization.replace("Bearer ", "");
  if (token) {
    try {
      const tokenJson = jwt.verify(token, process.env.SECRET_KEY);
      const user = await User.findOne({email: tokenJson.email, _id: tokenJson.id, name: tokenJson.name});
      if (user) {
      req.user = tokenJson;
      next()
    } else {
      res.status(403).json({ok: false, message: 'User not found'})
    }
    } catch (err) {
      res.status(403).json({ ok: false, message: 'Your token expired, please login again' });
    }
  } else {
    res.status(403).json({ ok: false, message: 'Token not correct.' });
  }
};

exports.timeOut = async function (req, res, next) {
    const current = Math.floor(Date.now() / 1000);
    const expTime = req.user.exp
    if (current <= expTime) {
      delete req.user.exp
      delete req.user.iat
      next();
    } else {
      try {
        const { email } = req.user;
        const authorization = req.headers.authorization.replace("Bearer ", "");
        const user = await User.findOne({ email });
        user.token = user.token.filter((id) => id !== authorization);
        await user.save();
        return res.status(403).json({ status: false, message: "Expired Login" });
      } catch (err) {
        return res.status(400).json({
          message: err.message,
        });
      }
    }
  }
