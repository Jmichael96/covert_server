const router = require('express').Router();
const reminders = require('../reminderAPI/routes');
const user = require('./user');
const clientValidator = require('../middleware/clientValidator');

// /**
//  * @name api/covert_server
//  * @function
//  * @param {string} path - Express path
//  * @param {callback} middleware - Express middleware
//  */
router.use('/api/covert_server', user);

// /**
//  * @name api/covert_server/reminders
//  * @function
//  * @param {string} path - Express path
//  * @param {callback} middleware - Check that client headers are passed in
//  * @param {callback} middleware - Validate that the user is authenticated and passes in a token
//  * @param {callback} middleware - Express middleware
//  */
router.use('/api/covert_server/reminders', clientValidator, reminders);

module.exports = router;