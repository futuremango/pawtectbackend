require('dotenv').config();
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// ADMIN_JWT_SECRET from .env
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;

exports.adminSignup = async (req, res) => {
  try {
    console.log('\n[Admin Signup] Attempt:', {
      email: req.body.email,
      time: new Date().toISOString()
    });

    // Check existing admin
    const existingAdmin = await Admin.findOne({ email: req.body.email });
    if (existingAdmin) {
      console.log('[Admin Signup] Conflict - Email already exists:', req.body.email);
      return res.status(409).json({ error: 'Admin already exists' });
    }

    // Create new admin
    const admin = await Admin.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    });

    console.log('[Admin Signup] Success - New admin created:', admin.email);

    // Generate JWT
    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      ADMIN_JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'Admin created successfully',
      token,
      admin: { _id: admin._id, name: admin.name, email: admin.email }
    });

  } catch (err) {
    console.error('[Admin Signup] Error:', {
      message: err.message,
      stack: err.stack,
      time: new Date().toISOString()
    });
    res.status(400).json({ error: err.message });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    console.log('\n[Admin Login] Attempt:', {
      email: req.body.email,
      time: new Date().toISOString()
    });

    // Find admin
    const admin = await Admin.findOne({ email: req.body.email });
    if (!admin) {
      console.log('[Admin Login] Fail - Admin not found:', req.body.email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await admin.matchPassword(req.body.password);
    if (!isMatch) {
      console.log('[Admin Login] Fail - Password mismatch for:', admin.email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Use ADMIN_JWT_SECRET explicitly
    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.ADMIN_JWT_SECRET, // Critical fix here
      { expiresIn: process.env.JWT_ADMIN_EXPIRES_IN || '1h' }
    );

    console.log('[Admin Login] Success - Logged in as:', admin.email);

    res.json({
      token,
      admin: { _id: admin._id, name: admin.name, email: admin.email }
    });

  } catch (err) {
    console.error('[Admin Login] Error:', {
      message: err.message,
      stack: err.stack,
      time: new Date().toISOString()
    });
    res.status(400).json({ error: err.message });
  }
};