let express = require('express');
let router = express.Router();
let submissionController = require('../controllers/api-submissions-controller');

router.get('/', submissionController.getSubmissions);
router.get('/:id', submissionController.getSubmission);
router.post('/:id/delete', submissionController.delete);

module.exports = function () {
  return router;
};
