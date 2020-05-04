const {allUser, createUser, setUserInactive, updateProfile, updatePasswords, getUser, changeRolesAdmin, forgotPassword, resetPassword} = require('../controllers/userController');
const {login, auth, logoutall, logout} = require('../controllers/authController');
const express = require('express');
const app = express();
const router = express.Router();
app.use(router);


router.get('/logout', auth, logout);

router.get('/logoutall', auth , logoutall);
// User controllers
router.route('/')
.get(allUser)
.post(createUser);

router.route('/:id')
.get(getUser)
.put(auth, updatePasswords);

router.put('/profile/:id', updateProfile);

router.put('/inactiveuser/:id', auth  , setUserInactive)

router.put('/adminconfig', auth  , changeRolesAdmin);

router.post('/login', login);

router.post('/forgotpassword', forgotPassword);

router.put('/resetpassword/:token', resetPassword);

module.exports = router;