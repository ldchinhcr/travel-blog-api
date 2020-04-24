const Cat = require("../models/category");
const User = require("../models/user");

exports.getCats = async function (req, res) {
  const cats = await Cat.find();
  res.status(200).json({ ok: true, categories: cats });
};

exports.createCat = async function (req, res) {
  const { cat, description } = req.body;
  try {
    const category = await Cat.create({ cat, description });
    res.status(201).json({ ok: true, category: category });
  } catch (err) {
    res.status(400).json({ ok: false, message: err.message });
  }
};

exports.getSingleCat = async function (req, res) {
  const cat = await Cat.findById(req.params.cId).populate({
    path: "tours",
    select: "-createdAt -updatedAt -__v -createdBy -id",
  });
  if (!cat)
    return res.status(404).json({ ok: false, message: "Category not found" });
  res.status(200).json({ ok: true, cat: cat });
};

exports.deleteCat = async function (req, res) {
  try {
    await Cat.findByIdAndDelete(req.params.cId);
    res.status(204).json();
  } catch (err) {
    res.status(400).json({ ok: false, message: err.message });
  }
};

exports.updateCat = async function(req, res) {
  try {
    const cat = await Cat.findById(req.params.cId);
    const user = await User.findById(req.user.id)
    if (user.roles === 'admin') {
    delete req.user
    if (req.body) {
    const fields = Object.keys(req.body);
    fields.map(item => cat[item] = req.body[item])
    cat.save();
    res.status(204).json({ok: true, message: 'Category updated successfully'})
}
} else {
  res.status(401).json({ok: false, error: 'Unauthorized'});
}
} catch (error) {
    res.status(400).json({ok: false, error: error.message});
}
}
