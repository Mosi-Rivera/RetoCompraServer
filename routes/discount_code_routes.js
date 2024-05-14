const { getDiscountCodes, getOneDiscountCode, updateDiscountCode, createDiscountCode, deleteDiscountcode, getDiscountTexts, getDiscountBanners, isValidDiscount } = require('../controllers/discount_code_controllers');
const { authenticateToken } = require('../middlewares/authorization');
const { validateRole } = require('../middlewares/validateRole');
const {STAFF, ADMIN} = require('../constants/role').obj;
const router = require('express').Router();

router.route('/').get(getDiscountCodes);

router.route('/texts').get(getDiscountTexts);

router.route('/banners').get(getDiscountBanners);

router.route('/isValidDiscount').get(isValidDiscount);

router.route('/').post(authenticateToken, validateRole([STAFF, ADMIN]), createDiscountCode);

router.route('/:code').patch(authenticateToken, validateRole([STAFF, ADMIN]), updateDiscountCode);

router.route('/:id').delete(authenticateToken, validateRole([STAFF, ADMIN]), deleteDiscountcode);

router.route('/:code').get(authenticateToken, getOneDiscountCode);

module.exports = router;
