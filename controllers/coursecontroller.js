const Course = require('../models/Course');

// Seed default courses used by the frontend
const DEFAULT_COURSES = [
	{ name: 'English', flag: '🇬🇧', color: '#667eea' },
	{ name: 'Hindi', flag: '🇮🇳', color: '#f093fb' },
	{ name: 'French', flag: '🇫🇷', color: '#11998e' },
	{ name: 'Korean', flag: '🇰🇷', color: '#764ba2' },
	{ name: 'Japanese', flag: '🇯🇵', color: '#f5576c' },
	{ name: 'Spanish', flag: '🇪🇸', color: '#38ef7d' }
];

async function listCourses(req, res) {
	try {
		const count = await Course.countDocuments();
		if (count === 0) {
			await Course.insertMany(DEFAULT_COURSES.map(c => ({ ...c })));
		}
		const courses = await Course.find().sort({ name: 1 });
		res.json(courses);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
}

async function getCourse(req, res) {
	try {
		const course = await Course.findOne({ name: req.params.name }).populate('registeredUsers.userId', 'name email');
		if (!course) return res.status(404).json({ message: 'Course not found' });
		res.json({
			...course.toObject(),
			totalRegisteredUsers: course.registeredUsers.length
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
}

module.exports = { listCourses, getCourse };
