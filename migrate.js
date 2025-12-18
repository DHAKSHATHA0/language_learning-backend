// Migration script to add courseId to existing registeredCourses
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');
const Course = require('./models/Course');

async function migrateData() {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log('✅ Connected to MongoDB');

		// Get all users
		const users = await User.find();
		console.log(`📦 Found ${users.length} users to migrate`);

		let updatedCount = 0;

		for (const user of users) {
			let userUpdated = false;

			// For each registered course, add courseId if missing
			for (const registeredCourse of user.registeredCourses) {
				if (!registeredCourse.courseId) {
					// Find the course by name
					const course = await Course.findOne({ name: registeredCourse.name });
					if (course) {
						registeredCourse.courseId = course._id;
						userUpdated = true;
						console.log(`✅ Added courseId for ${user.email} -> ${registeredCourse.name}`);
					} else {
						console.warn(`⚠️  Course not found: ${registeredCourse.name} for user ${user.email}`);
					}
				}
			}

			// Save if any changes were made
			if (userUpdated) {
				try {
					await user.save();
					updatedCount++;
				} catch (saveErr) {
					console.error(`⚠️  Error saving user ${user.email}:`, saveErr.message);
				}
			}
		}

		console.log(`\n✅ Migration complete! Updated ${updatedCount} users`);
		await mongoose.connection.close();
		process.exit(0);
	} catch (err) {
		console.error('❌ Migration error:', err);
		process.exit(1);
	}
}

migrateData();
