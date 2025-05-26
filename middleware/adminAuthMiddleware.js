const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
require('dotenv').config();

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;

const adminAuth = async (req, res, next) => {
  // Phase 1: Initial Setup and Validation
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1]; // Bearer <token>

  console.log(`\n[Admin Auth] ${new Date().toISOString()} - Incoming ${req.method} request to ${req.originalUrl}`);

  // Phase 2: Token Validation
  if (!token) {
    console.error('[Admin Auth] No token provided');
    return res.status(401).json({
      error: 'Authentication required',
      solution: 'Add valid Bearer token to Authorization header',
      docs: '/api-docs#admin-authentication'
    });
  }

  try {
    // Phase 3: JWT Verification
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET, {
      algorithms: ['HS256'],
      clockTolerance: 15 // 15-second grace period
    });

    console.log('[Admin Auth] Decoded Token:', {
      id: decoded.id,
      role: decoded.role,
      issued: new Date(decoded.iat * 1000).toISOString(),
      expires: new Date(decoded.exp * 1000).toISOString()
    });

    // Phase 4: Database Verification
    const admin = await Admin.findById(decoded.id)
      .select('-password -__v')
      .lean()
      .setOptions({ maxTimeMS: 5000 }); // 5-second timeout

    if (!admin) {
      console.error('[Admin Auth] Admin not found in database');
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'ADMIN_NOT_FOUND'
      });
    }

    // Phase 5: Role Validation
    if (admin.role !== 'admin') {
      console.error('[Admin Auth] Insufficient privileges:', admin.role);
      return res.status(403).json({
        error: 'Admin access required',
        code: 'INSUFFICIENT_PRIVILEGES'
      });
    }

    // Phase 6: Token Expiration Check
    const now = Date.now() / 1000;
    if (decoded.exp < now) {
      console.error('[Admin Auth] Token expired:', decoded.exp);
      return res.status(401).json({
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
        solution: 'Refresh your token'
      });
    }

    // Phase 7: Final Setup
    req.admin = {
      ...admin,
      _id: admin._id.toString(),
      authType: 'admin'
    };

    console.log(`[Admin Auth] Success: ${admin.email} authenticated`);
    next();

  } catch (err) {
    // Phase 8: Error Handling
    const errorType = err.name || 'UnknownAuthError';
    const errorDetails = {
      'TokenExpiredError': {
        code: 'TOKEN_EXPIRED',
        status: 401,
        message: 'Token has expired'
      },
      'JsonWebTokenError': {
        code: 'INVALID_TOKEN',
        status: 401,
        message: 'Malformed token'
      },
      'NotBeforeError': {
        code: 'TOKEN_INACTIVE',
        status: 401,
        message: 'Token not yet active'
      },
      'default': {
        code: 'AUTH_ERROR',
        status: 500,
        message: 'Authentication failed'
      }
    };

    const { code, status, message } = errorDetails[errorType] || errorDetails.default;

    console.error(`[Admin Auth] ${errorType}:`, {
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      token: process.env.NODE_ENV === 'development' ? token : undefined
    });

    return res.status(status).json({
      error: message,
      code,
      systemMessage: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

module.exports = adminAuth;