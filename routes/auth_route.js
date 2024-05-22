const router = require('express').Router();
const { registerController, loginController, whoAmIController, logoutController, verifyEmail, sendEmailVerification } = require('../controllers/auth_controllers');
const { authenticateToken } = require("../middlewares/authorization");

router.post('/register', registerController);

router.post('/login', loginController);

router.get('/whoAmI', authenticateToken, whoAmIController);

router.get('/logout', logoutController);

router.post('/verifyEmail', authenticateToken, verifyEmail);

router.get('/verifyEmail', authenticateToken, sendEmailVerification);

module.exports = router;
