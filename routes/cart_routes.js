const { addItemToCart, setItemQuantityCart, removeItemFromCart, clearCart } = require('../controllers/cart_controllers');
const { authenticateToken } = require('../middlewares/authorization');

const router = require('express').Router();

router.route('/addItem').post(authenticateToken, addItemToCart);

router.route('/setItemQuantity').patch(authenticateToken, setItemQuantityCart);

router.route('/removeItem').delete(authenticateToken, removeItemFromCart);

router.route('/clear').delete(authenticateToken, clearCart);

module.exports = router;
