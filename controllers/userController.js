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
		const { name, flag, color } = req.body;

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Check if user already registered
		if (user.registeredCourses.find(c => c.name === name)) {
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

		// Add course to user's registered courses
		user.registeredCourses.push({ 
			courseId: course._id, 
			name, 
			flag, 
			color, 
			progress: 0 
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

module.exports = { signup, login, getProfile, updateProfile, registerCourse, updateProgress, getCourseUsers };
