const { authenticateToken } = require('../middlewares/authorization');

const router = require('express').Router();

router.route('/addItem').post(authenticateToken, addItemToCart);

module.exports = router;
