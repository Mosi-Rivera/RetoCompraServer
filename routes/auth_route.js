const express = require('express');

const router = require('express').Router();

router.post('/register', registerController);

router.post('/login', loginController);

router.post('/logout', logoutController);

router.get('/whoami', authenticate, whoamiController);

module.exports = router;