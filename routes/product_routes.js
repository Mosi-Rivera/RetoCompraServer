


const { getProducts, searchProducts, getVariantInfo, getAllProducts, addCrudProduct, addCrudVariant, removeCrudProduct, removeCrudVariant, updateCrudProduct, updateCrudVariant } = require('../controllers/product_controllers');


const router = require('express').Router();

router.route('/').get(getProducts);

router.route('/search/:search').get(searchProducts);

router.route("/productInfo/:params").get(getVariantInfo);

router.route("/getAllProducts").get(getAllProducts)

router.route('/crudProductsroutes').patch(updateCrudProduct);

router.route('/deleteProduct').delete(removeCrudProduct);

router.route('/crudProductsroutes').post(addCrudProduct);

router.route('/crudVariantsroutes').patch(updateCrudVariant);

router.route('/deleteVariant').delete(removeCrudVariant);

router.route('/crudVariantsroutes').post(addCrudVariant);


module.exports = router;
