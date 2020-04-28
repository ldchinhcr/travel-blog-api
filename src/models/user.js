const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

const schema = mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      unique: true,
      validate: {
        validator: function (value) {
          return validator.isEmail(value);
        }
      }
    },
    name: {
      first: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
      },
      last: {
        type: String,
        required: [true, "Last name is required"],
        trim: true,
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
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
    token: []
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

schema.statics.loginWithCredentials = async (email, password) => {
  const user = await User.findOne({email: email.toLowerCase()});
  if (!user) throw new Error("User not found");
  const auth = await bcrypt.compare(password.toString(), user.password);
  if (!auth) throw new Error("Password not correct");
  return user;
};

schema.statics.generateToken = async (user) => {
  const token = await jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    process.env.SECRET_KEY,
    { expiresIn: process.env.TOKEN_LIFE }
  );
  user.token.push(token);
  user.save();
  return token;
};

schema.methods.toJSON = function () {
  const userObj = this.toObject();
  delete userObj.roles;
  delete userObj.token;
  delete userObj.password;
  delete userObj.__v;
  delete userObj.dob;
  return userObj;
};

schema.pre("save", async function (next) {
  if (!this.isModified("password")) next();
  const hashedPassword = await bcrypt.hash(this.password, saltRounds);
  this.password = hashedPassword;
  next();
});

const User = mongoose.model("User", schema);

module.exports = User;
