const { getDiscountCodes, getOneDiscountCode, updateDiscountCode, createDiscountCode, deleteDiscountcode } = require('../controllers/discount_code_controllers');
const { authenticateToken } = require('../middlewares/authorization');
const { validateRole } = require('../middlewares/validateRole');
const {STAFF, ADMIN} = require('../constants/role').obj;
const router = require('express').Router();

router.route('/:code').get(authenticateToken, getOneDiscountCode);

router.route('/').get(getDiscountCodes);

router.route('/').post(authenticateToken, validateRole([STAFF, ADMIN]), createDiscountCode);

router.route('/:code').patch(authenticateToken, validateRole([STAFF, ADMIN]), updateDiscountCode);

router.route('/:id').delete(authenticateToken, validateRole([STAFF, ADMIN]), deleteDiscountcode);

module.exports = router;
