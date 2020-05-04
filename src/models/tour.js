const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const schema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Title is required.'],
        trim: true,
        unique: true,
        maxlength: [40, 'A tour name must have less or equal then 40 characters'],
        minlength: [10, 'A tour name must have greater or equal then 10 characters'],
        // validate: [validator.isAlpha, 'Tour name must only contain character']
    },
    slug: String,
    summary: {
        type: String,
        required: [true, 'Summary is required.'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    duration: {
        type: Number,
        required: [true, 'Duration is required.']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour mush havea group size.']
    },
    difficulty: {
        type: String,
        required: [true, 'Difficulty is required.'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either "easy", "medium" or "difficult"'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: { 
        type: Number,
        required: [true, 'Price is required.'],
        trim: true
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                return val < this.price
            },
            message: 'Discount price ({VALUE}) should be below regular price.'
        }
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    startDates: [Date],
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    secretTour: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

schema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'tour'
  });

  schema.methods.toJSON = function () {
    const Obj = this.toObject();
    delete Obj.createdAt;
    delete Obj.updatedAt;
    delete Obj.__v;
    return Obj;
  };

  
  schema.pre('save', function(next) {
      this.slug = slugify(this.name, { lower: true });
      next();
    });
    
    schema.pre(/^find/, function(next) {
        this.find({secretTour: {$ne: true}});
        next();
    })

  schema.pre('aggregate', function(next) {
    this.pipeline().unshift({ $match: { secretTour: {$ne: true} } });
    next();
  });
  
const Tour = mongoose.model('Tour', schema);

module.exports = Tour;