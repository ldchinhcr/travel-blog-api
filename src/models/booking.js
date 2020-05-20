const mongoose = require('mongoose');

const schema = mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Booking must have a UserId']
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Booking must have a TourId']
    },
    paymentID: {
        type: String,
        default: null,
        required: [true, 'Booking must have a PaymentID']
    },
    quantity: {
        type: Number,
        required: [true, 'Booking must have a quantity'],
        min: [0, 'Quantity must be greater than or equal to 1']
    },
    total: {
        type: Number,
        required: [true, 'Booking must have a total'],
        min: [0, 'Total must be greater than or equal to 0']
    },
    paid: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})



schema.statics.countBooking = async function (tourId) {
    const count = await Booking.aggregate([
        {$match: {tour: tourId}},
        {$group: {_id: "$tour", count: {$sum: "$quantity"}}}
    ]);
    return count[0] ? count[0].count : 0;
}

const Booking = mongoose.model('Booking', schema);

module.exports = Booking;