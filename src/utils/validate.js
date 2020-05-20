const User = require("../models/user");
const Cat = require("../models/category");
const Review = require("../models/review");
const Tour = require("../models/tour");
const AppError = require("./appError");


exports.roleCheck = async function(req,res, next) {
    const user = await User.findById(req.user.id)
    if (user && user.roles !== 'user'){
        next()
    } else{
        return next(new AppError('Forbidden', 403));
    }
}


exports.validateCat = async function(req,res,next) {
    const cat = await Cat.findById(req.params.cId);
    if (cat) {
        req.cat = cat;
        next();
    } else {
        return next(new AppError("There's no such category!", 404));
    }
}


exports.validateTour = async function(req,res,next) {
    const tour = await Tour.findById(req.params.tId);
    if (tour) {
        req.tour = tour;
        next();
    } else {
        return next(new AppError("There's no such tour in our db!", 404));
    }
}

exports.validateReview = async function(req,res,next) {
    const review = await Review.findById(req.params.rId);
    if (review) {
        req.review = review;
        next();
    } else {
        return next(new AppError("There's no such review in our db!", 404));
    }
}