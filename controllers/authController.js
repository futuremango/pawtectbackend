const User = require('../models/User');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "b0aed02f7908ca86a04db670a59fc8c26ae29e13af0d4beb024f3efabd748a4d";

exports.signup = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    console.log(`\n=== Signup Attempt ===\nEmail: ${email}\nName: ${name}\nIP: ${req.ip}`);
    // Additional server-side validation
    if (!phone || !/^\d{10,15}$/.test(phone)) {
      return res.status(400).json({ error: 'Valid phone number required' });
    }
    console.log(`Phone type: ${typeof phone}, value: ${phone}`);

    // Check existing user
    console.log(`[${new Date().toISOString()}] Checking existing users...`);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`❌ Duplicate registration attempt: ${email}`);
      return res.status(400).json({ error: 'User already exists' });
    }
// Validate required fields
if (!phone) {
  return res.status(400).json({ error: 'Phone number is required' });
}
    // Create user
    console.log(`[${new Date().toISOString()}] Creating new user...`);
    const user = new User({ name, email, password,phone });
    
    // Save user
    console.log(`[${new Date().toISOString()}] Saving user to database...`);
    await user.save();
    console.log(`✅ User saved | ID: ${user._id}`);

    // Generate token
    console.log(`[${new Date().toISOString()}] Generating JWT token...`);
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    console.log(`🔑 Token generated for: ${email}`);

    console.log(`\n=== Signup Success ===\nUser: ${email}\nID: ${user._id}\n`);
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { _id: user._id, name: user.name, email: user.email }
    });

  } catch (err) {
    console.error(`\n⚠️ Signup Error [${new Date().toISOString()}]\nEmail: ${req.body.email}\nError: ${err.message}\nStack: ${err.stack}\n`);
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`\n=== Login Attempt ===\nEmail: ${email}\nIP: ${req.ip}`);

    console.log(`[${new Date().toISOString()}] Searching for user...`);
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log(`[${new Date().toISOString()}] Verifying password...`);
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      console.log(`❌ Password mismatch for: ${email}`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log(`[${new Date().toISOString()}] Generating session token...`);
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    console.log(`🔑 New token issued for: ${email}`);

    console.log(`\n=== Login Success ===\nUser: ${email}\nID: ${user._id}\nToken: ${token.slice(-10)}...\n`);
    res.status(200).json({
      token,
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        phone: user.phone,
        location: user.location
      }
    });

  } catch (err) {
    console.error(`\n⚠️ Login Error [${new Date().toISOString()}]\nEmail: ${req.body.email}\nError: ${err.message}\nStack: ${err.stack}\n`);
    res.status(400).json({ error: err.message });
  }
};