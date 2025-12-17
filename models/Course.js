const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
	name: { type: String, required: true, unique: true },
	flag: { type: String },
	color: { type: String },
	description: { type: String },
	registeredUsers: [{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		registeredAt: { type: Date, default: Date.now },
		progress: { type: Number, default: 0 }
	}]
}, { timestamps: true });

module.exports = mongoose.models.Course || mongoose.model('Course', CourseSchema);
