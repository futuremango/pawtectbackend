require('dotenv').config();
console.log('Environment Variables Loaded:');
console.log('CLIENT_URL:', process.env.CLIENT_URL ? '✅' : '❌ Missing');
console.log('Email user loaded:', process.env.EMAIL_USER ? '✅' : '❌ Missing');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const cron = require('node-cron');
const transporter = require('./config/emailConfig'); // Only once
//=======================For chatbot=======================
const fetch = require('node-fetch'); // npm install node-fetch@2
const PYTHON_API_URL = 'https://pawtect-fyp-production.up.railway.app/api/chat'; // Python FastAPI backend
//=======================For chatbot=======================


// Create Express app first
const app = express();

// Middleware setup
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Static files and CORS
app.use('/uploads/images', express.static(path.join(__dirname, 'uploads/images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors({ 
  origin: ['https://pawtect-fyp.vercel.app','https://pawtect-fyp-production.up.railway.app'],
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, '../client/public/images')));


// Database connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Import routes
const adoptionRoutes = require('./routes/adoptionRoutes');
const authRoutes = require('./routes/authRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const rescueRoutes = require('./routes/rescueRoutes');
const surrenderRoutes = require('./routes/surrenderRoutes');
const postRoutes = require('./routes/postRoutes');
const profileRoutes = require('./routes/profileRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const adminRoutes = require('./routes/adminRoutes');
const vetRoutes = require('./routes/vetRoutes');
const adminDataRoutes = require('./routes/adminData');
const vetLoginRoute = require('./routes/VetLoginRoute');
const donationRoutes = require('./routes/donationRoutes'); // Add donation routes
const notificationRoutes = require('./routes/notificationRoutes');
const vetAppointmentsRoute = require("./routes/vetAppointmentsRoute");

// Route handlers
app.use('/api/adoption', adoptionRoutes);
app.use('/api', authRoutes);
app.use('/api', volunteerRoutes);
app.use('/api', rescueRoutes);
app.use('/api', surrenderRoutes);
app.use('/api', postRoutes);
app.use('/api', profileRoutes);
app.use('/api/admin', adminAuthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/vet', vetRoutes);
app.use('/api/admin', adminDataRoutes);
app.use('/api/vet', vetLoginRoute);
app.use('/api/donations', donationRoutes); // Add donations endpoint
app.use('/api/notifications', notificationRoutes);
app.use("/api/appointments", vetAppointmentsRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

//=======================For chatbot=======================
app.post('/api/chat', async (req, res) => {
  try {
    const pyRes = await fetch(PYTHON_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    if (!pyRes.ok) throw new Error('Python API returned an error');
    const data = await pyRes.json();
    res.json(data);
  } catch (err) {
    console.error('Chatbot Proxy Error:', err);
    res.status(500).json({ 
      answer: 'Chatbot is currently unavailable. Please try again later.' 
    });
  }
});
// Server startup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Server running on https://pawtect-fyp-production.up.railway.app');
  console.log(`Node.js proxy server for chatbot ready`);
});