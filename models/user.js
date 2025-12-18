const mongoose = require('mongoose');

const RegisteredCourseSchema = new mongoose.Schema({
	courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
	name: { type: String, required: true },
	flag: { type: String },
	color: { type: String },
	progress: { type: Number, default: 0 },
	registeredAt: { type: Date, default: Date.now },
	badge: { type: String, default: null }, // Store badge emoji (e.g., "🏆")
	stars: { type: Number, default: 0 }, // Number of stars earned
	completedLessons: { type: [String], default: [] }, // Array of completed lesson types
	completed: { type: Boolean, default: false }, // Whether course is fully completed
	registrationCount: { type: Number, default: 1 }, // How many times user registered this course
	completionDate: { type: Date, default: null }, // When course was completed
	daysToComplete: { type: Number, default: null }, // Days taken to complete the course
	badgeCount: { type: Number, default: 0 } // Total badges earned by user (aggregate)
}, { strict: false });

const UserSchema = new mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	registeredCourses: { type: [RegisteredCourseSchema], default: [] },
	totalBadges: { type: Number, default: 0 } // Total badges earned across all courses
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
