const router = require('express').Router();
const { registerController, loginController, whoAmIController, logoutController } = require('../controllers/auth_controllers');
const { authenticateToken } = require("../middlewares/authorization")

router.post('/register', registerController);

router.post('/login', loginController);

router.get('/whoAmI', authenticateToken, whoAmIController);

router.get('/logout', logoutController);

module.exports = router;
