const { getProducts } = require('../controllers/product_controllers');

const router = require('express').Router();

router.route('/').get(getProducts);

module.exports = router;