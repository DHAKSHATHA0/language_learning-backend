const express = require('express');
const router = express.Router();
const { listCourses, getCourse } = require('../controllers/coursecontroller');

router.get('/', listCourses);
router.get('/:name', getCourse);

module.exports = router;
