const catchAsync = require('./catchAsync');
const AppError = require('./appError');
const User = require('../models/user');
const Cat = require('../models/category');
const slugify = require('slugify');
const sendEmail = require('./email');


const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const sendVerification = async (user, res, next) => {
  const verifyToken = await user.createVerifyToken();

  const verifyURL = `${process.env.CLIENT_DOMAIN}/verifyaccount/?verifytoken=${verifyToken}`;

    const link = `${process.env.CLIENT_DOMAIN}/login`;;
    const namebutton = 'Login';
    const msg = `To successfully verify your account please click this link: ${verifyURL}  .\n Thank you!`;
    const html = verifyHTMLForm(msg, namebutton, link);
  try {
    await sendEmail({
      email: user.email,
      subject: 'Please verify your account (valid for 60 mins)',
      html,
    });

    res.status(200).json({
      status: true,
      message: 'Verify token sent to email',
      data: user
    });
  } catch (err) {
    user.verifyToken = undefined;
    user.verifyExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(err.message)
    return next(
      new AppError(
        'There was an error when trying to send the email. Try again later!',
        500
      )
    );
  }
}

const ownerCheck = async function (user, Model, id) {
  try {
    const item = await Model.findById(id);
    if (!item) {
      throw new AppError('That ID not exists in our db', 404);
    }
    if (
      item.organizer.toString() === user._id.toString() ||
      user.roles === 'admin' ||
      user.roles === 'editor'
    ) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.log(err.message);
  }
};

exports.createOne = (Model) =>
  catchAsync(async function (req, res, next) {
    const bodyData = { ...req.body };
    switch (Model.modelName) {
      case 'User':
      if (await User.findOne({email: req.body.email}))
      {
        return next(new AppError('Bad request', 400))
      }
        break;
      case 'Category':
        break;
      case 'Tour':
        bodyData.organizer = req.user.id;
        break;
      case 'Review':
        bodyData.tour = req.tour._id;
        bodyData.createdBy = req.user.id;
        break;
      default:
        bodyData = { ...req.body };
    }
    const doc = await Model.create(bodyData);
    if (doc && !doc.verified) {
      sendVerification(doc, res, next)
    } else {
      res.status(201).json({ status: true, data: doc });
    }
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    let filteredBody = {};
    let id;
    switch (Model.modelName) {
      case 'Tour':
        id = req.params.tId;
        if (await ownerCheck(req.user, Model, id)) {
          filteredBody = filterObj(
            req.body,
            'name',
            'summary',
            'description',
            'duration',
            'maxGroupSize',
            'difficulty',
            'ratingsAverage',
            'ratingsQuantity',
            'price',
            'priceDiscount',
            'imageCover',
            'images',
            'startDates',
            'secretTour',
            'guides'
          );
          if (Object.keys(filteredBody).includes('name')) {
            filteredBody.slug = slugify(filteredBody.name, { lower: true });
          }
        } else {
          return next(
            new AppError(
              "You don't have permission to perform this action",
              403
            )
          );
        }
        break;
      case 'Review':
        id = req.params.rId;
        if (await ownerCheck(req.user.id, Model, id)) {
          filteredBody = filterObj(req.body, 'content', 'rating');
        } else {
          return next(
            new AppError(
              "You don't have permission to perform this action",
              403
            )
          );
        }
        break;
      case 'User':
        id = req.user.id;
        if (await ownerCheck(req.user.id, Model, id)) {
          filteredBody = filterObj(req.body, 'name', 'email', 'dob');
        } else {
          return next(
            new AppError(
              "You don't have permission to perform this action",
              403
            )
          );
        }
        break;
      case 'Category':
        id = req.params.cId;
        if (await ownerCheck(req.user.id, Model, id)) filteredBody = req.body;
        break;
      default:
        filteredBody = {};
    }
    const item = await Model.findOneAndUpdate({_id: id}, filteredBody, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ status: true, data: item });
  });

exports.deleteOne = (Model) =>
  catchAsync(async function (req, res, next) {
    let id;
    if ((Model.modelName = 'Review')) {
      id = req.params.rId;
    } else if ((Model.modelName = 'Tour')) {
      id = req.params.tId;
    } else if ((Model.modelName = 'Category')) {
      id = req.params.cId;
    }
    await Model.findOneAndDelete({ _id: id });
    res.status(204).end();
  });
