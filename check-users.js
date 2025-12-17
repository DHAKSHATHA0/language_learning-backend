const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/user');

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({});
    console.log('Total users:', users.length);
    users.forEach(u => console.log(`- ${u.name} (${u.email})`));
    await mongoose.disconnect();
  } catch (e) {
    console.error('Error:', e.message);
  }
}

check();
