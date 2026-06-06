const router = require('express').Router();
const ctrl = require('../controllers/driverController');

router.post('/activate', ctrl.activate);
router.post('/location', ctrl.updateLocation);
router.post('/report', ctrl.report);
router.post('/end-session', ctrl.endSession);
router.get('/active', ctrl.getActive);

module.exports = router;
