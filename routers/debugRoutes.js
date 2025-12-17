const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

router.get('/token', (req, res) => {
  const authHeader = req.headers.authorization || req.headers.Authorization || req.query.token || null;
  const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

  let decoded = null;
  if (authHeader) {
    const parts = authHeader.split(' ');
    const token = parts.length === 2 ? parts[1] : parts[0];
    try {
      console.log('[debug/token] Verifying token. JWT_SECRET (first 20 chars):', JWT_SECRET.slice(0, 20));
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('[debug/token] SUCCESS. Decoded:', decoded);
    } catch (err) {
      console.log('[debug/token] FAILED to verify:', err.message);
      decoded = { error: err.message };
    }
  }

  res.json({ authorizationHeader: authHeader ? authHeader.slice(0, 50) + '...' : null, decoded });
});

// Diagnose auth issues
router.post('/test-register', auth, (req, res) => {
  console.log('[test-register] Auth passed! User:', req.user);
  const { name } = req.body;
  res.json({ success: true, message: 'Auth passed!', userId: req.user.id, course: name });
});

module.exports = router;
