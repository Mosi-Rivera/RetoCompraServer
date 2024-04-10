const { getProducts, searchProducts, getVariantInfo , addCrudProduct,addCrudVariant,removeCrudProduct,removeCrudVariant,updateCrudProduct,updateCrudVariant } = require('../controllers/product_controllers');

const router = require('express').Router();

router.route('/').get(getProducts);

router.route('/search/:search').get(searchProducts);

router.route("/productInfo/:params").get(getVariantInfo);

router.route('/crudProductsroutes').patch(updateCrudProduct);

router.route('/crudProductsroutes').delete(removeCrudProduct);

router.route('/crudProductsroutes').post(addCrudProduct);

router.route('/crudVariantsroutes').patch(updateCrudVariant);

router.route('/crudVariantsroutes').delete(removeCrudVariant);

router.route('/crudVariantsroutes').post(addCrudVariant);

module.exports = router;
