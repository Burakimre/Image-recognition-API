let express = require('express');
let router = express.Router();
let middleware = require('../middleware/middleware');
let userController = require('../controllers/user-controller');
router.use(middleware.hasAccess('user'));

// GET profile page
router.get('/profile', userController.index);
module.exports = function () {
    return router;
};
