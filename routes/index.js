let express = require('express');
let router = express.Router();

// ==========================
// GET routes ===============
// ==========================

// GET home page
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = function () {
  return router;
};
