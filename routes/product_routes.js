const { getProducts, searchProducts, getVariantInfo } = require('../controllers/product_controllers');

const router = require('express').Router();

router.route('/').get(getProducts);

router.route('/search/:search').get(searchProducts);

router.route("/productInfo/:params").get(getVariantInfo);

router.route('/crudProductsroutes').patch(updateCrudProduct);

router.route('/crudProductsroutes').delete(removeCrudProduct);

router.route('/crudProductsroutes').post(addCrudProduct);

router.route('/crudProductsroutes').patch(updateCrudVariant);

router.route('/crudProductsroutes').delete(removeCrudVariant);

router.route('/crudProductsroutes').post(addCrudVariant);

module.exports = router;
