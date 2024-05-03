const router = require('express').Router();
const { checkoutController, getOrdersController, setDeliveryStatusController } = require('../controllers/order_controllers');
const { authenticateToken } = require('../middlewares/authorization');
const isEmailVerified = require('../middlewares/isEmailVerified');
const { validateRole } = require('../middlewares/validateRole');
const {STAFF, ADMIN} = require('../constants/role').obj;

router.route('/').get(authenticateToken, validateRole([STAFF, ADMIN]), getOrdersController);
router.route('/status').patch(authenticateToken, validateRole([STAFF, ADMIN]), setDeliveryStatusController);
router.route('/checkout').post(authenticateToken, isEmailVerified, checkoutController);
router.route('/test').post((req, _, next) => { req.email = req.body.email; next(); }, checkoutController);

module.exports = router;
