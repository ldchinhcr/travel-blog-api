const User = require("../models/user");

exports.getUser = async (req, res)=> {
    const user = await User.findById(req.params.id)
    .populate("userTours", "_id title description")
    res.status(200).json({status: true, data: user});
}
exports.createUser = async (req,res) => {
    try {
        if (req.body.dob) {
            const user = await User.create({
                email: req.body.email.toLowerCase(),
                name: req.body.name,
                password: req.body.password,
                dob: req.body.dob
            })
            res.status(201).json({status: true, data: user});
        } else {
            const user = await User.create({
                email: req.body.email.toLowerCase(),
                name: req.body.name,
                password: req.body.password
            })
            res.status(201).json({status: true, data: user});
        }
    } catch (e) {
        res.status(400).json({status: false, error: e.message});
    }
}

exports.updateUser = async function(req, res) {
    const user = await User.findById(req.params.id);
    delete req.user
    try {
    if (req.body) {
    req.body.token = []
    req.body.email = req.body.email.toLowerCase();
    const fields = Object.keys(req.body);
    fields.map(item => user[item] = req.body[item])
    user.save();
    res.status(200).json({ok: true, message: 'User updated successfully. Please login again.'})
}
} catch (error) {
    res.status(400).json({ok: false, error: error.message});
}
}

exports.changeRolesAdmin = async function(req, res) {
    try {
    await User.findByIdAndUpdate(req.user.id,{ roles: 'admin'})
    res.status(200).json({ok: true, message: "User's roles updated successfully."})
} catch (error) {
    res.status(400).json({ok: false, error: error.message});
}
}