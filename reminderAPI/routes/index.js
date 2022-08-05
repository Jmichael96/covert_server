const router = require('express').Router();
const reminder = require('./reminder');

router.use(reminder);

module.exports = router;