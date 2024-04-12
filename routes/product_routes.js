const { getProducts, searchProducts, getVariantInfo, getAllProducts } = require('../controllers/product_controllers');

const router = require('express').Router();

router.route('/').get(getProducts);

router.route('/search/:search').get(searchProducts);

router.route("/productInfo/:params").get(getVariantInfo);

router.route("/getAllProducts").get(getAllProducts)

module.exports = router;
