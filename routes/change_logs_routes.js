const { getChanglogsController } = require('../controllers/changelogs_controllers');

const router = require('express').Router();

//TODO: Add auth and role middleware;
router.route('/').get(getChanglogsController);

module.exports = router;
