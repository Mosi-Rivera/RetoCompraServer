const router = require('express').Router();
const {authenticate} = require('../middleware/authMiddleware');
const { registerController, loginController, whoAmIController } = require('../controllers/auth_controllers');

router.post('/register', registerController);

router.post('/login', loginController);

router.get('/whoAmI', authenticate, whoAmIController);

module.exports = router;
