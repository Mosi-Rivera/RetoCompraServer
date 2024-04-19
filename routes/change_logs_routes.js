const { getChanglogsController } = require('../controllers/changelogs_controllers');
const {authenticateToken} = require('../middlewares/authorization');

const router = require('express').Router();

//TODO: Add auth and role middleware;
router.route('/').get(authenticateToken, getChanglogsController);

module.exports = router;
