const express = require('express');

const router = require('express').Router();
const {registerController}= require('../controllers/auth_controllers');
router.post('/register', registerController);

// router.post('/login', loginController);

// router.post('/logout', logoutController);

// router.get('/whoami', authenticate, whoamiController);

module.exports = router;