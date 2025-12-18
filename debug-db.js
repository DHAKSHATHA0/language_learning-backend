// Debug script to check user data in database
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');
const Course = require('./models/Course');

async function debugData() {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log('✅ Connected to MongoDB');

		const users = await User.find().limit(3);
		console.log('\n📋 Sample Users:');
		console.log(JSON.stringify(users, null, 2));

		const courses = await Course.find();
		console.log('\n📋 All Courses:');
		console.log(JSON.stringify(courses, null, 2));

		await mongoose.connection.close();
		process.exit(0);
	} catch (err) {
		console.error('❌ Error:', err);
		process.exit(1);
	}
}

debugData();
