const {createUser, updateUser, getUser, changeRolesAdmin, forgotPassword, resetPassword} = require('../controllers/userController');
const {login, auth, timeOut, logoutall, logout} = require('../controllers/authController');
const express = require('express');
const app = express();
const router = express.Router();
app.use(router);


router.get('/logout', auth, logout);

router.get('/logoutall',auth , logoutall);
// User controllers
router.route('/')
.post(createUser);

router.route('/:id')
.get(getUser)
.put(auth, timeOut, updateUser);

router.put('/adminconfig', auth, timeOut, changeRolesAdmin);

router.post('/login', login);

router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);

module.exports = router;