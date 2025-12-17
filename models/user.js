const mongoose = require('mongoose');

const RegisteredCourseSchema = new mongoose.Schema({
	name: { type: String, required: true },
	flag: { type: String },
	color: { type: String },
	progress: { type: Number, default: 0 }
});

const UserSchema = new mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	registeredCourses: { type: [RegisteredCourseSchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
