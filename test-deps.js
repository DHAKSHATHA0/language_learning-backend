const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_super_secret_jwt_key_change_this_in_production_2024';

async function test() {
  try {
    console.log('Testing JWT signing...');
    const userId = '507f1f77bcf86cd799439011';
    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
    console.log('Token created:', token.substring(0, 40) + '...');
    
    console.log('Testing token verification...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token verified. Decoded ID:', decoded.id);
    
    console.log('Testing bcrypt...');
    const password = 'password123';
    const hash = await bcrypt.hash(password, 10);
    console.log('Password hashed');
    
    const match = await bcrypt.compare(password, hash);
    console.log('Password match:', match);
    
    console.log('All tests passed!');
  } catch (e) {
    console.error('Error:', e.message);
    console.error('Stack:', e.stack);
  }
}

test();
