const {allUser, createUser, setUserInactive, updateProfile, updatePasswords, getUser, changeRolesAdmin, forgotPassword, resetPassword, verifyAccount} = require('../controllers/userController');
const {login, auth, logoutall, logout} = require('../controllers/authController');
const {loginFacebook, facebookAuth} = require('../auth/fbHandler');
const {loginGG, ggAuth} = require('../auth/ggHandler');
const {loginGithub, githubAuth} = require('../auth/githubHandler');

const express = require('express');
const app = express();
const router = express.Router();
app.use(router);

router.route('/profile')
.get(auth, getUser)
.put(auth, updateProfile)

router.get("/facebook", loginFacebook);
router.get("/facebook/authorized", facebookAuth);

router.get("/google", loginGG);
router.get("/google/authorized", ggAuth);

router.get("/github", loginGithub);
router.get("/github/authorized", githubAuth);

router.get('/logout', auth, logout);

router.get('/logoutall', auth , logoutall);
// User controllers

router.put('/inactiveuser/:id',auth , setUserInactive)

router.put('/adminconfig/:id',auth , changeRolesAdmin);

router.post('/login', login);

router.put('/verifyaccount', verifyAccount);

router.post('/forgotpassword', forgotPassword);

router.put('/resetpassword', resetPassword);

router.route('/')
.get(allUser)
.post(createUser);

router.route('/:id')
.get(getUser)
.put(auth, updatePasswords);

module.exports = router;