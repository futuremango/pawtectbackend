const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = "b0aed02f7908ca86a04db670a59fc8c26ae29e13af0d4beb024f3efabd748a4d";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : null;
  console.log(`[Auth Middleware] Incoming request to ${req.originalUrl}`);
  console.log('[Auth Middleware] Received token:', token?.slice(0, 10) + '...');
  if (!token) {
    return res.status(401).json({ 
      error: 'Missing token. Login required.',
      code: 'NO_TOKEN'
    });
  }


  try {
    console.log('Headers:', req.headers);
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Received token:', token || 'No token provided');
    
    if (!token) {
      return res.status(401).json({ error: 'Authorization denied' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded user:', decoded);
    
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    res.status(401).json({ error: 'Token is not valid' });
  }
};


module.exports = authMiddleware;