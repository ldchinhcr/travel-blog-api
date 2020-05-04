const catchAsync = require('./catchAsync');
const AppError = require('./appError');
const User = require('../models/user');
const slugify = require('slugify');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const ownerCheck = async function (reqId, Model, id) {
  try {
  const item = await Model.findById(id);
  if (!item) {
    throw new AppError('That ID not exists in our db', 404);
  }
  const user = await User.findById(reqId);
  if (
    item.createdBy.toString() === reqId.toString() ||
    user.roles === 'admin' ||
    user.roles === 'editor'
  ) {
    return true;
  }
} catch (err) {
    console.log(err.message);
}
};

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

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    let filteredBody = {};
    let id;
    switch (Model.modelName) {
      case 'Tour':
        id = req.params.tId;
        if (await ownerCheck(req.user.id, Model, id)) {
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
            'secretTour'
          );
        }
        if (Object.keys(filteredBody).includes('name')) {
            filteredBody.slug = slugify(filteredBody.name, { lower: true });
        }
        break;
      case 'Review':
        id = req.params.rId;
        if (await ownerCheck(req.user.id, Model, id))
          filteredBody = filterObj(req.body, 'content', 'rating');
        break;
      case 'User':
        id = req.user.id;
        if (await ownerCheck(req.user.id, Model, id))
          filteredBody = filterObj(req.body, 'name', 'email', 'dob');
        break;
      case 'Category':
        id = req.params.cId;
        if (await ownerCheck(req.user.id, Model, id)) filteredBody = req.body;
        break;
      default:
        filteredBody = {};
    }
    const item = await Model.findByIdAndUpdate(id, filteredBody, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ ok: true, data: item });
  });
