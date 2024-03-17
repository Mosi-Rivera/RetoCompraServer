const { getProducts, searchProducts, getInfo } = require('../controllers/product_controllers');

const router = require('express').Router();

router.route('/').get(getProducts);

router.route('/search/:search').get(searchProducts);


module.exports = router;
