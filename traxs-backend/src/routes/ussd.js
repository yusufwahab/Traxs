const router = require('express').Router();
const { ussdWebhook } = require('../controllers/ussdController');

router.post('/', ussdWebhook);

module.exports = router;
