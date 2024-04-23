const { getUsers, setUserRole } = require('../controllers/user_controllers');

const router = require('express').Router();

//TODO: ADD routed guards;

router.route('/').get(getUsers);

router.route('/role').patch(setUserRole);

module.exports = router;
