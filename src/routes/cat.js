const {createCat, getCats, getSingleCat, deleteCat, updateCat} = require('../controllers/catController');
const {roleCheck} = require('../utils/validate');
const {auth} = require('../controllers/authController');

const express = require('express');
const app = express();
const router = express.Router();
app.use(router);

router.route('/:cId')
.get(getSingleCat)
.delete(auth, roleCheck, deleteCat)
.put(auth, roleCheck, updateCat);

router.route('/')
.get(getCats)
.post(auth, createCat);

module.exports = router;
