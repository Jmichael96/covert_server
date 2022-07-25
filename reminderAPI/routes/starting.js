const router = require('express').Router();
const startingController = require('../controllers');

router.get('/starting', startingController.starting.start);

module.exports = router;