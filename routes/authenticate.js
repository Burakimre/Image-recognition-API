let express = require('express');
let router = express.Router();
let authController = require('../controllers/auth-controller');

// ==========================
// GET routes ===============
// ==========================
router.get('/login', authController.getLogin);
router.get('/signup', authController.getSignup);
router.get('/logout', authController.getLogout);

// ==========================
// LOCAL routes =============
// ==========================
router.post('/signup', authController.postLocalSignup);
router.post('/login', authController.postLocalLogin);

// ==========================
// FACEBOOK routes ==========
// ==========================
router.get('/auth/facebook', authController.getAuthFacebook);
router.get('/auth/facebook/callback', authController.getAuthFacebookCallback);

// ==========================
// GOOGLE routes ============
// ==========================
router.get('/auth/google', authController.getAuthGoogle);
router.get('/auth/google/callback', authController.getAuthGoogleCallback);

// ==========================
// AUTHORIZE ================
// ==========================

/* local */
router.get('/connect/local', authController.getConnectLocal);
router.post('/connect/local', authController.postConnectLocal);

/* facebook */
router.get('/connect/facebook', authController.getConnectFacebook);
router.get('/connect/facebook/callback', authController.getConnectFacebookCallback);

/* google */
router.get('/connect/google', authController.getConnectGoogle);
router.get('/connect/google/callback', authController.getConnectGoogleCallback);

// ==========================
// UNLINK ===================
// ==========================

// local
router.get('/unlink/local', authController.unlinkLocal);

// facebook
router.get('/unlink/facebook', authController.unlinkFacebook);

// google
router.get('/unlink/google', authController.unlinkGoogle);

module.exports = function () {
  return router;
};
