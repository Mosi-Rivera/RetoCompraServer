const { getProducts, searchProducts, getVariantInfo } = require('../controllers/product_controllers');

const router = require('express').Router();

router.route('/').get(getProducts);

router.route('/search/:search').get(searchProducts);

router.route("/productInfo/:params").get(getVariantInfo);

router.route('/api/crudProductsroutes').patch(updateCrudProduct);

router.route('/api/crudProductsroutes').delete(removeCrudProduct);

router.route('/api/crudProductsroutes').post(addCrudProduct);

router.route('/api/crudProductsroutes').patch(updateCrudVariant);

router.route('/api/crudProductsroutes').delete(removeCrudVariant);

router.route('/api/crudProductsroutes').post(addCrudVariant);

module.exports = router;
