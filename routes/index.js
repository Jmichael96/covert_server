const router = require('express').Router();
const reminders = require('../reminderAPI/routes');

router.use('/api/reminders', reminders);

module.exports = router;