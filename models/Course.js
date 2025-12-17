const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
	name: { type: String, required: true, unique: true },
	flag: { type: String },
	color: { type: String },
	description: { type: String }
}, { timestamps: true });

module.exports = mongoose.models.Course || mongoose.model('Course', CourseSchema);
