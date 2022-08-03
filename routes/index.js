const router = require('express').Router();
const reminders = require('../reminderAPI/routes');
const user = require('./user');
const clientValidator = require('../middleware/clientValidator');

/**
 * @name api/covert_server
 * @function
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
router.use('/api/covert_server', user);

/**
 * @name api/covert_server/reminders
 * @function
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
router.use('/api/covert_server/reminders', clientValidator, reminders);

module.exports = router;