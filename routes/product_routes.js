const { getProducts, searchProducts, getVariantInfo, getAllProducts, addCrudProduct, addCrudVariant, removeCrudProduct, removeCrudVariant, updateCrudProduct, updateCrudVariant, searchAllProducts, getAllVariants, getSingleProduct, getSingleVariant } = require('../controllers/product_controllers');
const {authenticateToken} = require('../middlewares/authorization');
const {validateRole} = require('../middlewares/validateRole');
const {STAFF, ADMIN} = require('../constants/role').obj;

const router = require('express').Router();

router.route('/').get(getProducts);

router.route('/search/:search').get(searchProducts);

router.route("/productInfo/:params").get(getVariantInfo);

router.route("/getAllProducts").get(authenticateToken, validateRole([STAFF, ADMIN]), getAllProducts);

router.route("/getAllVariants").get(authenticateToken, validateRole([STAFF, ADMIN]), getAllVariants);

router.route("/getSingleProduct/:id").get(authenticateToken, validateRole([STAFF, ADMIN]), getSingleProduct);

router.route("/getSingleVariant/:id").get(authenticateToken, validateRole([STAFF, ADMIN]), getSingleVariant);

router.route("/searchProducts").get(authenticateToken, validateRole([STAFF, ADMIN]), searchAllProducts);

router.route('/crudProductsroutes').patch(authenticateToken, validateRole([STAFF, ADMIN]), updateCrudProduct);

router.route('/deleteProduct').delete(authenticateToken, validateRole([STAFF, ADMIN]), removeCrudProduct);

router.route('/crudProductsroutes').post(authenticateToken, validateRole([STAFF, ADMIN]), addCrudProduct);

router.route('/crudVariantsroutes').patch(authenticateToken, validateRole([STAFF, ADMIN]), updateCrudVariant);

router.route('/deleteVariant').delete(authenticateToken, validateRole([STAFF, ADMIN]), removeCrudVariant);

router.route('/crudVariantsroutes').post(authenticateToken, validateRole([STAFF, ADMIN]), addCrudVariant);

module.exports = router;
