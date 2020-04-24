const mongoose = require('mongoose');

const schema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required.'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required.'],
        trim: true
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
  
const Tour = mongoose.model('Tour', schema);

module.exports = Tour;