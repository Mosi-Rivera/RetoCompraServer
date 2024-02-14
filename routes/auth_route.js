const router = require('express').Router();
const {authenticate} = require('../middleware/authMiddleware');
const { registerController, loginController, whoAmIController, logoutController } = require('../controllers/auth_controllers');

router.post('/register', registerController);

router.post('/login', loginController);

router.get('/whoAmI', authenticate, whoAmIController);

router.get('/logout', logoutController);

module.exports = router;
