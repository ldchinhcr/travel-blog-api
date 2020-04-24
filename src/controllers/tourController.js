const Tour = require("../models/tour");
const Cat = require("../models/category");

exports.createTour = async function (req, res) {
  try {
    const tour = await Tour.create({
      title: req.body.title,
      description: req.body.description,
      category: req.cat._id,
      createdBy: req.user.id,
    });
    res.status(201).json({ ok: true, tour: tour });
  } catch (err) {
    res.status(500).json({ ok: false, err: err.message });
  }
};

exports.updateTour = async function (req, res) {
  try {
    const tour = await Tour.findById(req.params.tId);
    if (tour.createdBy.toString() === req.user.id.toString()) {
    delete req.user;
    delete req.cat;
    delete req.tour;
    if (req.body) {
      const fields = Object.keys(req.body);
      fields.map((item) => (tour[item] = req.body[item]));
      tour.save();
      res.status(200).json({ ok: true, message: "Tour updated successfully" });
    }
  } else {
    res.status(401).json({ ok: false, err: 'Unauthorized' });
  }
   } catch (err) {
    res.status(500).json({ ok: false, err: err.message });
  }
};

exports.getTour = async function (req, res) {
  try {
    // const tour = await Tour.find({category: req.cat._id})
    // .populate("createdBy", "_id email name")
    // .populate({
    //     path: "category",
    //     select: "-createdAt -updatedAt -__v"
    // })
    const cat = await Cat.findById(req.cat._id).populate({
      path: "tours",
      select: "-createdAt -updatedAt -__v -createdBy -id",
    })
    res.status(200).json({ ok: true, tour: cat });
  } catch (err) {
    res.status(500).json({ ok: false, err: err.message });
  }
};

exports.getSingleTour = async function (req, res) {
  try {
    const tour = await Tour.find({ _id: req.params.tId })
      .populate("createdBy", "_id email name")
      .populate({
        path: "category",
        select: "-createdAt -updatedAt -__v",
      });
    if (tour.length === 0) return res.status(404).json({ ok: false, err: 'Tour id not exist' });
    res.status(200).json({ ok: true, tour: tour });
  } catch (err) {
    res.status(500).json({ ok: false, err: err.message });
  }
};

exports.deleteTour = async function (req, res) {
    try {
      const tour = await Tour.findById(req.params.tId);
      if (tour.createdBy.toString() === req.user.id.toString()) {
      await Tour.findByIdAndDelete(req.params.tId);
      res.status(204).json();
      } else {
      res.status(401).json({ ok: false, message: 'Unauthorized' });
      }
    } catch (err) {
      res.status(400).json({ ok: false, message: err.message });
    }
  };