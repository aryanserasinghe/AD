const express = require('express');
const path = require('path');
const validate = require('../../middlewares/validate');
const authValidation = require('../../validations/auth.validation');
const authController = require('../../controllers/auth.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.get('/register', (req, res) => {
  // res.sendFile(__dirname + '/../view/auth/login.html');
  res.sendFile(path.join(__dirname, '../../view', 'auth', 'register.html'));
});

router.get('/login', (req, res) => {
  // res.sendFile(__dirname + '/../view/auth/login.html');
  res.sendFile(path.join(__dirname, '../../view', 'auth', 'login.html'));
});

module.exports = router;
