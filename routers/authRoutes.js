const express = require('express');
const router = express.Router();
const { signup, login, getProfile } = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', auth, getProfile);

module.exports = router;
