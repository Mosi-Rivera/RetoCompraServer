const router = require('express').Router();
const { checkoutController, getOrdersController, setDeliveryStatusController } = require('../controllers/order_controllers');
const { authenticateToken } = require('../middlewares/authorization');

router.route('/').get(getOrdersController);
router.route('/status').patch(setDeliveryStatusController);
router.route('/checkout').post(authenticateToken, checkoutController);
router.route('/test').post((req, _, next) => { req.email = req.body.email; next(); }, checkoutController);


module.exports = router;
