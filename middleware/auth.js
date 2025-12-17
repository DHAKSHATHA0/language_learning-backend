const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

function extractToken(req) {
	// Common places a token may be provided
	const authHeader = req.headers.authorization || req.headers.Authorization;
	const xToken = req.headers['x-access-token'] || req.headers['token'];

	if (authHeader) {
		// Accept 'Bearer <token>' or just the token
		const parts = authHeader.split(' ');
		if (parts.length === 1) return parts[0];
		if (parts.length === 2) return parts[1];
		return null;
	}

	if (xToken) return xToken;

	// fallback to body or query (useful for debugging/forms)
	if (req.body && req.body.token) return req.body.token;
	if (req.query && req.query.token) return req.query.token;
	return null;
}

function auth(req, res, next) {
	let token = extractToken(req);
	console.log('[DEBUG] Received request with token:', token ? 'Token present' : 'No token');
	console.log('[DEBUG] Authorization header:', req.headers.authorization);
	if (!token) {
		console.error('[auth] ERROR: No token provided. Authorization header:', req.headers.authorization);
		return res.status(401).json({ message: 'No token provided' });
	}

	// strip potential surrounding quotes
	token = token.replace(/^"|"$/g, '').trim();

	try {
		console.log('[auth] Attempting to verify token. Token (first 40 chars):', token.slice(0, 40));
		console.log('[auth] Using JWT_SECRET (first 20 chars):', JWT_SECRET.slice(0, 20));
		const decoded = jwt.verify(token, JWT_SECRET);
		console.log('[auth] SUCCESS: Token verified. Decoded user id:', decoded.id);
		req.user = { id: decoded.id };
		return next();
	} catch (err) {
		console.error('[auth] ERROR: Token verification failed:', err.message);
		console.error('[auth] Token error type:', err.name);
		console.error('[auth] Authorization header:', req.headers.authorization);
		console.error('[auth] Extracted token (first 40 chars):', (token && token.slice ? token.slice(0,40) : token));
		return res.status(401).json({ message: 'Token verification failed: ' + err.message });
	}
}


module.exports = auth;
