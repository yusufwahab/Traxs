const router = require('express').Router();
const ctrl = require('../controllers/inferenceController');

router.get('/vehicles', ctrl.getVehicles);
router.get('/corridors', ctrl.getCorridors);
router.get('/ghost-corridors', ctrl.getGhostCorridors);
router.get('/events', ctrl.getEvents);

module.exports = router;
