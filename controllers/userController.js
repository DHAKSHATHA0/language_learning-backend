const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Course = require('../models/Course');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

async function signup(req, res) {
	try {
		const { name, email, password } = req.body;
		if (!name || !email || !password) {
			return res.status(400).json({ message: 'Missing fields' });
		}

		const existing = await User.findOne({ email });
		if (existing) {
			return res.status(400).json({ message: 'Email already in use' });
		}

		const hash = await bcrypt.hash(password, 10);
		const user = await User.create({ name, email, password: hash });
		const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
		
		res.json({
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email
			}
		});
	} catch (err) {
		console.error('Signup error:', err);
		res.status(500).json({ message: err.message });
	}
}

async function login(req, res) {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(400).json({ message: 'Missing fields' });
		}

		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ message: 'Invalid credentials' });
		}

		const ok = await bcrypt.compare(password, user.password);
		if (!ok) {
			return res.status(400).json({ message: 'Invalid credentials' });
		}

		const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
		res.json({
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email
			}
		});
	} catch (err) {
		console.error('Login error:', err);
		res.status(500).json({ message: err.message });
	}
}

async function getProfile(req, res) {
	try {
		const id = req.user?.id || req.params.id;
		const user = await User.findById(id).select('-password');
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		res.json(user);
	} catch (err) {
		console.error('Get profile error:', err);
		res.status(500).json({ message: err.message });
	}
}

async function updateProfile(req, res) {
	try {
		const id = req.user?.id || req.params.id;
		const updates = req.body;
		if (updates.password) delete updates.password;

		const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
		res.json(user);
	} catch (err) {
		console.error('Update profile error:', err);
		res.status(500).json({ message: err.message });
	}
}

async function registerCourse(req, res) {
	try {
		const userId = req.user.id;
		const { name, color } = req.body;
		const flag = '🗣️'; // Default flag for all courses

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Check if user already registered this course
		const existingCourse = user.registeredCourses.find(c => c.name === name);
		if (existingCourse) {
			return res.status(400).json({ message: 'Already registered' });
		}

		// Find or create the course
		let course = await Course.findOne({ name });
		if (!course) {
			course = await Course.create({ name, flag, color });
		}

		// Add user to course's registered users
		const userAlreadyInCourse = course.registeredUsers.some(u => u.userId.toString() === userId);
		if (!userAlreadyInCourse) {
			course.registeredUsers.push({ userId, progress: 0 });
			await course.save();
		}

		// Ensure all existing courses have courseId before adding new one
		for (const registeredCourse of user.registeredCourses) {
			if (!registeredCourse.courseId) {
				const existingCourse = await Course.findOne({ name: registeredCourse.name });
				if (existingCourse) {
					registeredCourse.courseId = existingCourse._id;
				}
			}
		}

		// Add course to user's registered courses with tracking fields
		user.registeredCourses.push({ 
			courseId: course._id, 
			name, 
			flag, 
			color, 
			progress: 0,
			registrationCount: 1, // First registration
			badgeCount: 0 // Initial badge count for this course
		});
		await user.save();
		
		res.json({
			message: 'Course registered successfully',
			registeredCourses: user.registeredCourses
		});
	} catch (err) {
		console.error('Register course error:', err);
		res.status(500).json({ message: err.message });
	}
}

async function updateProgress(req, res) {
	try {
		const userId = req.user.id;
		const { courseName } = req.params;
		const { progress } = req.body;

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		const course = user.registeredCourses.find(c => c.name === courseName);
		if (!course) {
			return res.status(404).json({ message: 'Course not registered' });
		}

		course.progress = Number(progress) || 0;
		await user.save();

		// Update course's registered users progress
		const courseDoc = await Course.findById(course.courseId);
		if (courseDoc) {
			const userRegistration = courseDoc.registeredUsers.find(u => u.userId.toString() === userId);
			if (userRegistration) {
				userRegistration.progress = Number(progress) || 0;
				await courseDoc.save();
			}
		}

		res.json(course);
	} catch (err) {
		console.error('Update progress error:', err);
		res.status(500).json({ message: err.message });
	}
}

// Get all users registered for a specific course
async function getCourseUsers(req, res) {
	try {
		const { courseName } = req.params;
		const course = await Course.findOne({ name: courseName }).populate('registeredUsers.userId', 'name email');
		
		if (!course) {
			return res.status(404).json({ message: 'Course not found' });
		}

		res.json({
			courseName: course.name,
			totalUsers: course.registeredUsers.length,
			users: course.registeredUsers
		});
	} catch (err) {
		console.error('Get course users error:', err);
		res.status(500).json({ message: err.message });
	}
}

// Sync all course data (badges, stars, completedLessons) to backend
async function syncCourseData(req, res) {
	try {
		const userId = req.user.id;
		const { registeredCourses } = req.body;

		if (!Array.isArray(registeredCourses)) {
			return res.status(400).json({ message: 'registeredCourses must be an array' });
		}

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		let totalBadges = 0;

		// Update each course with the latest data from frontend
		for (const frontendCourse of registeredCourses) {
			const dbCourse = user.registeredCourses.find(c => c.name === frontendCourse.name);
			if (dbCourse) {
				// Update all fields while preserving courseId and registeredAt
				dbCourse.badge = frontendCourse.badge || null;
				dbCourse.stars = frontendCourse.stars || 0;
				dbCourse.completedLessons = frontendCourse.completedLessons || [];
				dbCourse.progress = frontendCourse.progress || 0;
				dbCourse.completed = frontendCourse.completed || false;

				// Track badge count for this course
				if (frontendCourse.badge) {
					dbCourse.badgeCount = (dbCourse.badgeCount || 0) + 1;
					totalBadges++;
				}

				// If course just completed, record completion date and calculate days
				if (frontendCourse.completed && !dbCourse.completionDate) {
					dbCourse.completionDate = new Date();
					// Calculate days from registration to completion
					const registrationDate = new Date(dbCourse.registeredAt);
					const completionDateObj = new Date(dbCourse.completionDate);
					const timeDiff = completionDateObj - registrationDate;
					dbCourse.daysToComplete = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
				}

				// Update registration count if provided
				if (frontendCourse.registrationCount) {
					dbCourse.registrationCount = frontendCourse.registrationCount;
				}
			}
		}

		// Calculate total badges for user
		user.totalBadges = user.registeredCourses.reduce((count, course) => {
			return count + (course.badge ? 1 : 0);
		}, 0);

		await user.save();
		res.json({
			message: 'Course data synced successfully',
			registeredCourses: user.registeredCourses,
			totalBadges: user.totalBadges
		});
	} catch (err) {
		console.error('Sync course data error:', err);
		res.status(500).json({ message: err.message });
	}
}

module.exports = { signup, login, getProfile, updateProfile, registerCourse, updateProgress, getCourseUsers, syncCourseData };
