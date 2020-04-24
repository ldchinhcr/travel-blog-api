const User = require("../models/user");

exports.getUser = async (req, res)=> {
    const user = await User.findById(req.params.id)
    .populate("userTours", "_id title description")
    res.status(200).json({status: true, data: user});
}
exports.createUser = async (req,res) => {
    const {email, name, password, dob} = req.body;
    try {
        if (req.body.dob) {
            const user = new User({email, name, password, dob: dob})
            await user.save();
            res.status(201).json({status: true, data: user});
        } else {
            const user = new User({email, name, password})
            await user.save();
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