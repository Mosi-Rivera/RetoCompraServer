const { getChanglogsController } = require('../controllers/changelogs_controllers');
const {authenticateToken} = require('../middlewares/authorization');
const {validateRole} = require('../middlewares/validateRole');
const {STAFF, ADMIN} = require('../constants/role').obj;

const router = require('express').Router();

//TODO: Add auth and role middleware;
router.route('/').get(authenticateToken, validateRole([STAFF, ADMIN]), getChanglogsController);

module.exports = router;
