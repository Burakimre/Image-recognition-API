let express = require('express');
let router = express.Router();
let middleware = require('../middleware/middleware');
let targetsController = require('../controllers/targets-controller');
router.use(middleware.hasAccess('admin'));

router.get('/', targetsController.index);
router.get('/new', targetsController.create);
router.get('/:id', targetsController.details);
router.get('/:id/edit', targetsController.edit);
module.exports = function () {
    return router;
};
