const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
	courseName: { type: String, required: true },
	type: { type: String, enum: ['letters','words','quiz','stories'], required: true },
	title: { type: String },
	content: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.models.Lesson || mongoose.model('Lesson', LessonSchema);
