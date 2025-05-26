const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    authMethod: 'PLAIN', // Force PLAIN auth
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
  tls: {
    ciphers: 'TLS_AES_256_GCM_SHA384', // Match cipher from openssl test
    minVersion: 'TLSv1.3'
  },

  logger: true,
  debug: true
});

transporter.verify(error => {
  if (error) {
    console.error('❌ Email Connection Error:', error);
  } else {
    console.log('✅ SMTP Connection Verified');
  }
});

module.exports = transporter;