const mongoose = require('mongoose');

const schema = mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: true
    },
    content: {
        type: String,
        required: [true, 'Content is required.'],
        trim: true
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required.'],
        trim: true,
        min: 1,
        max: 10
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true}
});

schema.methods.toJSON = function () {
    const Obj = this.toObject();
    delete Obj.createdAt;
    delete Obj.updatedAt;
    delete Obj.__v;
    return Obj;
  };

const Review = mongoose.model('Review', schema);

module.exports = Review;