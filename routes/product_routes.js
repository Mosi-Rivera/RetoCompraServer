const { getProducts, searchProducts, getVariantInfo } = require('../controllers/product_controllers');

const router = require('express').Router();

router.route('/').get(getProducts);

router.route('/search/:search').get(searchProducts);

router.route("/productInfo/:params").get(getVariantInfo);


module.exports = router;
