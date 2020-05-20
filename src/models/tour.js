const mongoose = require('mongoose');
const slugify = require('slugify');
const Review = require('./review');
const Booking = require('./booking');
const Cat = require('./category');


const schema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Title is required.'],
      trim: true,
      unique: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [
        10,
        'A tour name must have greater or equal then 10 characters',
      ],
    },
    slug: String,
    summary: {
      type: String,
      required: [true, 'Summary is required.'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required.'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour mush have a group size.'],
      min: [1, 'Group size must be greater than or equal to 1.']
    },
    availability: {
      type: Number,
      required: [true, 'Availability is required.'],
      default: 10,
      min: [0, 'Availability must be greater or equal to 0.']
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required.'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either "easy", "medium" or "difficult"',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Price is required.'],
      trim: true,
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price.',
      },
    },
    organizer: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Tour must have an organizer.']
    },
    category: [{
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: true,
    }],
    guides:[
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ],
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

schema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'tour',
});

schema.methods.toJSON = function () {
  const Obj = this.toObject();
  delete Obj.createdAt;
  delete Obj.updatedAt;
  delete Obj.__v;
  return Obj;
};

schema.pre("save", async function (next) {
  this.slug = slugify(this.name, { lower: true });
  if (!this.isModified("guides")) next();
  const found = await mongoose.model('User').find({"_id": {$in: this.guides}}).select("_id")
  if (found.length !== this.guides.length) {
    next(new AppError('This guide(s) does not exist.', 400));
  }
  next();
})

schema.pre('save', async function (next) {
  if (!this.isModified('maxGroupSize')) next();

  const booked = await Booking.countBooking(this._id);
  this.availability = this.maxGroupSize - booked;

  if(this.availability < 0) {
    next(new AppError('Booking exceeds availability slot',400));
  }
  next();
});


schema.pre(/^findOneAndUpdate/, async function (next) {
  if (!this._update.maxGroupSize) next();
  const booked = await Booking.countBooking(this._conditions._id);
  this._update.availability = this._update.maxGroupSize - booked;
  if (this._update.availability < 0) {
    next(new AppError('Booking exceeds availability slot',400));
  }
  next();
})

schema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.populate({
    path: 'guides',
    select: '-__v -token -password -createdAt -updatedAt -roles'
  })
  .populate('organizer','-__v -token -password -roles')
  next();
});

schema.post('findOneAndDelete', async function () {
  await Review.deleteMany({ tour: this._conditions._id });
});

schema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});


const Tour = mongoose.model('Tour', schema);

module.exports = Tour;
