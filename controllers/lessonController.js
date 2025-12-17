const Lesson = require('../models/Lesson');

async function getLessons(req, res) {
	try {
		const { course, type } = req.query;
		const query = {};
		if (course) query.courseName = course;
		if (type) query.type = type;

		const lessons = await Lesson.find(query).sort({ createdAt: 1 });
		res.json(lessons);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
}

// Optional: add custom seed endpoint to populate some basic lessons
async function seedDefaultLessons(req, res) {
	try {
		const defaultWords = [
			{ word: 'Apple', translation: 'Manzana', emoji: '🍎' },
			{ word: 'Book', translation: 'Libro', emoji: '📚' }
		];

		const existing = await Lesson.countDocuments();
		if (existing === 0) {
			await Lesson.create({ courseName: 'Spanish', type: 'words', title: 'Basics', content: defaultWords });
		}
		res.json({ seeded: true });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
}

module.exports = { getLessons, seedDefaultLessons };
