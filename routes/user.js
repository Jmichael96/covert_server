const router = require('express').Router();
const UserController = require('../controllers/user');
const { validateUser } = require('../middleware/creationValidator');
const clientValidator = require('../middleware/clientValidator');

/**
 * Create your new account with Covert Server
 * 
 * @name Create a new user
 * @route {POST} /api/covert_server/new_user
 * @bodyparam {String} name Your full name
 * @bodyparam {String} email Your email
 * @bodyparam {String} password Your password
 * @bodyparam {String} phone Your 10 digit phone number
 * @headerparam {String} client-id The unique client-id given to you by the owner
 * @headerparam {String} client-secret The unique client-secret given to you by the owner
 * @headerparam {String} Content-Type application/json
 */
router.post('/new_user', clientValidator, validateUser, UserController.newUser);

/**
 * Login to the Covert Server App
 * 
 * @name Login
 * @route {POST} /api/covert_server/login
 * @bodyparam {String} email Your email
 * @bodyparam {String} password Your password
 * @headerparam {String} client-id The unique client-id given to you by the owner
 * @headerparam {String} client-secret The unique client-secret given to you by the owner
 * @headerparam {String} Content-Type application/json
 */
router.post('/login', UserController.login);

module.exports = router;