const {getTourStats, getMonthlyPlan, aliasTopTours, filteredTours} = require('../controllers/tourController');
const express = require('express');
const app = express();

const router = express.Router({mergeParams: true});
app.use(router);

router.get('/top-5-cheap', aliasTopTours, filteredTours);

router.get('/', getTourStats);

router.get('/monthly-plan/:year', getMonthlyPlan);

module.exports = router;