const mongoose = require("mongoose");
const validator = require("validator");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const saltRounds = 12;
const jwt = require("jsonwebtoken");
const AppError = require('../utils/appError');


const schema = mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      unique: true,
      lowercase: true,
      validate: [
        validator.isEmail,
        'Please provide a valid email']
    },
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        validator: function (value) {
          return value === this.password;
        },
        message: 'Passwords are not the same.'
      }
    },
    dob: {
      type: Date,
      required: false,
      default: new Date(),
      trim: true,
    },
    roles: {
      type: String,
      enum: ["user", "admin", "editor"],
      default: "admin",
    },
    token: [],
    verified: {
      type: Boolean,
      default: false,
      select: false
    },
    verifyToken: String,
    verifyExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false
    }
  },
  {
    timestamps: true,
    toJson: { virtuals: true },
    toObject: { virtuals: true },
  }
);

schema.virtual('userTours', {
  ref: 'Tour',
  localField: '_id',
  foreignField: 'createdBy'
});

schema.statics.loginWithCredentials = async function(email, password) {
  const user = await User.findOne({email: email.toLowerCase()});
  if (!user) throw new AppError("Email not correct", 401);
  if (!user.password) throw new AppError("Try with login with social networks, and change password", 400);
  const auth = await bcrypt.compare(password.toString(), user.password);
  if (!auth) throw new AppError("Password not correct", 401);
  return user;
};

schema.statics.generateToken = async (user) => {
  const token = await jwt.sign(
    { id: user._id, email: user.email, name: user.name, roles: user.roles },
    process.env.SECRET_KEY,
    { expiresIn: process.env.TOKEN_LIFE }
  );
  return token;
};

schema.statics.findOneOrCreate = async ({name, email}) => {
  let user = await User.findOne({email})
  if (!user) {
    user = new User({name, email})
    user.token.push(await User.generateToken(user))
    await user.save({ validateBeforeSave: false })
  } else {
    user.token.push(await User.generateToken(user))
    await user.save({ validateBeforeSave: false })
  }
  return user
}

schema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
  .createHash('sha256')
  .update(resetToken)
  .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
}

schema.methods.createVerifyToken = async function() {
  const verifyToken = crypto.randomBytes(32).toString('hex');

  this.verifyToken = crypto
  .createHash('sha256')
  .update(verifyToken)
  .digest('hex');

  this.verifyExpires = Date.now() + 60 * 60 * 1000;
  await this.save({ validateBeforeSave: false });
  return verifyToken;
}

schema.methods.toJSON = function () {
  const userObj = this.toObject();
  delete userObj.roles;
  delete userObj.active;
  delete userObj.token;
  delete userObj.password;
  delete userObj.__v;
  delete userObj.dob;
  return userObj;
};

schema.pre("save", async function (next) {
  if (!this.isModified("password")) next();
  this.password = await bcrypt.hash(this.password, saltRounds);
  this.passwordConfirm = undefined;
  next();
});

schema.pre(/^find/, function(next) {
  this.find({active: true});
  next();
})

const User = mongoose.model("User", schema);

module.exports = User;
