const router = require('express').Router();
const ctrl = require('../controllers/passengerController');

router.post('/event', ctrl.postEvent);

module.exports = router;
