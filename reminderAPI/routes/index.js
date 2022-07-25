const router = require('express').Router();
const startingRoutes = require('./starting');

router.use('/startingRoute', startingRoutes);

module.exports = router;