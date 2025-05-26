const transporter = require('./config/emailConfig');
transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER,
  subject: 'Final Test',
  text: 'Connection Verified'
}, (err, info) => {
  if (err) {
    console.error('FATAL ERROR:', err);
    process.exit(1);
  }
  console.log('SUCCESS:', info);
  process.exit(0);
});
require('dotenv').config({ path: '.env' }); // Force .env location
console.log('ENV Check:', {
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS ? '***' : 'MISSING'
});