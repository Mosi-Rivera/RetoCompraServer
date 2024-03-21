const router = require('express').Router();
const { checkoutController } = require('../controllers/checkout_controllers');
const {authenticateToken} = require('../middlewares/authorization');

router.route('/').post(authenticateToken, checkoutController);

module.exports = router;
