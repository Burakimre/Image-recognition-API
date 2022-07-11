let express = require('express');
let router = express.Router();
let targetsController = require('../controllers/api-targets-controller');
let submissionController = require('../controllers/api-submissions-controller');

router.get('/', targetsController.getTargets);
router.get('/:id', targetsController.getTarget);
router.post('/', targetsController.store);
router.post('/:id', targetsController.update);
router.post('/:id/delete', targetsController.delete);

router.post('/:id/submissions', submissionController.store);
router.get('/:id/submissions', targetsController.getSubmissions);
router.get('/:id/submissions/:submission_id', targetsController.getSubmission);
router.get('/:id/submissions/:submission_id/tags', targetsController.getSubmissionTags);
router.get('/:id/submissions/:submission_id/tags/:name', targetsController.getSubmissionTag);

module.exports = function () {
  return router;
};
