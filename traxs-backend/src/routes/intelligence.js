const router = require('express').Router();
const ctrl = require('../controllers/intelligenceController');

router.get('/planner/overview', ctrl.plannerOverview);
router.get('/investor/routes', ctrl.investorRoutes);
router.get('/government/city-health', ctrl.cityHealth);
router.post('/government/simulate-policy', ctrl.simulatePolicy);

module.exports = router;
