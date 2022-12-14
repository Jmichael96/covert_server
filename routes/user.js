const router = require('express').Router();
const UserController = require('../controllers/user');
const { validateUser } = require('../middleware/creationValidator');
const clientValidator = require('../middleware/clientValidator');
const verifyRefreshToken = require('../middleware/verifyRefreshToken');
const auth = require('../middleware/auth');

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

/**
 * @name get/load_user
 * @private 
 * Load the current authenticated user
 */
router.get('/load_user', auth, UserController.loadUser);

/**
 * @name post/logout
 * @public 
 * Logout the authenticated user
 */
router.post('/logout', UserController.logout);

/**
 * @name post/refresh_token
 * @private 
 * Load refresh token
 */
router.post('/refresh_token', auth, verifyRefreshToken, UserController.refreshToken);

/**
 * FIXME This is for testing
 * @name get/secure
 * @private 
 */
router.get('/secure', auth, UserController.secure);

/**
 * Update User Info
 * @name put/update_user_info
 * @function
 * @returns {object}
 * @private
 * @param {object} request - Express request
 * @param {object} response - Express response
 * @param {callback} next - Express next function
 * @property {string} req.body.name - Name of user
 * @property {string} req.body.email - Email of user
 * @property {string} req.body.phone - Phone of user
 * @property {string} req.body.password - Password of user
 * @property {string} req.body.newPassword - New password of user
 */
router.put('/update_user_info', auth, clientValidator, UserController.updateUserInfo);

module.exports = router;