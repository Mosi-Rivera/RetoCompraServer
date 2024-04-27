const { getUsers, setUserRole } = require('../controllers/user_controllers');
const { authenticateToken } = require('../middlewares/authorization');
const { validateRole } = require('../middlewares/validateRole');
const {STAFF, ADMIN} = require('../constants/role').obj;

const router = require('express').Router();

//TODO: ADD routed guards;

router.route('/').get(authenticateToken, validateRole([STAFF, ADMIN]), getUsers);

router.route('/role').patch(authenticateToken, validateRole([STAFF, ADMIN]), setUserRole);

module.exports = router;
