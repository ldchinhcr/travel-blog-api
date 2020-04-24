const User = require("../models/user");
const Cat = require("../models/category");
const Review = require("../models/review");
const Tour = require("../models/tour");


exports.roleCheck = async function(req,res, next) {
    const user = await User.findById(req.user.id)
    if (user && user.roles !== 'user'){
        next()
    } else{
        res.status(403).json({ok: false, message: 'Forbidden'})
    }
}


exports.validateCat = async function(req,res,next) {
    const cat = await Cat.findById(req.params.cId);
    if (cat) {
        req.cat = cat;
        next();
    } else {
        res.status(404).json({ok: false, message: "There's no such category!"});
    }
}


exports.validateTour = async function(req,res,next) {
    const tour = await Tour.findById(req.params.tId);
    if (tour) {
        req.tour = tour;
        next();
    } else {
        res.status(404).json({ok: false, message: "There's no such tour in our db!"});
    }
}

exports.validateReview = async function(req,res,next) {
    const review = await Review.findById(req.params.rId);
    if (review) {
        req.review = review;
        next();
    } else {
        res.status(404).json({ok: false, message: "There's no such review in our db!"});
    }
}