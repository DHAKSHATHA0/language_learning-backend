const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  registerCourse,
  updateProgress
} = require('../controllers/userController');

router.get('/me', auth, getProfile);
router.put('/me', auth, updateProfile);
router.post('/me/register', auth, registerCourse);
router.put('/me/courses/:courseName/progress', auth, updateProgress);

module.exports = router;
