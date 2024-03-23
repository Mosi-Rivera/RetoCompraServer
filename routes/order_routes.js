const router = require('express').Router();
const { checkoutController } = require('../controllers/order_controllers');
const {authenticateToken} = require('../middlewares/authorization');

router.route('/checkout').post(authenticateToken, checkoutController);
router.route('/test').post((req, _, next) => {req.email = req.body.email; next();}, checkoutController);

module.exports = router;