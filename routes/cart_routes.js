const { addItemToCart, setItemQuantityCart, removeItemFromCart, clearCart, getCart } = require('../controllers/cart_controllers');
const { authenticateToken } = require('../middlewares/authorization');
const isEmailVerified = require('../middlewares/isEmailVerified');

const router = require('express').Router();

router.route('/').get(authenticateToken, getCart);

router.route('/addItem').post(authenticateToken, isEmailVerified, addItemToCart);

router.route('/setItemQuantity').patch(authenticateToken, isEmailVerified, setItemQuantityCart);

router.route('/removeItem').delete(authenticateToken, isEmailVerified, removeItemFromCart);

router.route('/clear').delete(authenticateToken, isEmailVerified, clearCart);

module.exports = router;
