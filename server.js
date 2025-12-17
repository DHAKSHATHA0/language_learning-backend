// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB().catch(err => console.error('DB connection error:', err));

// Import routes
const authRoutes = require('./routers/authRoutes');
const courseRoutes = require('./routers/courseRoutes');
const lessonRoutes = require('./routers/lessonRoutes');
const userRoutes = require('./routers/userRoutes');
const debugRoutes = require('./routers/debugRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/users', userRoutes);
app.use('/api/debug', debugRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.get('/', (req, res) => {
  res.json({ ok: true });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
