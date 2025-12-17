const express = require('express');
const router = express.Router();
const { getLessons, seedDefaultLessons } = require('../controllers/lessonController');
const auth = require('../middleware/auth');

router.get('/', getLessons);
// Protected seed endpoint (optional)
router.post('/seed', auth, seedDefaultLessons);

module.exports = router;
