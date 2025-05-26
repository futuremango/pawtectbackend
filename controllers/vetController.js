const mongoose = require('mongoose');
const VetAppointment = require('../models/vetModel');
const transporter = require('../config/emailConfig'); // Use shared transporter
const { Types: { ObjectId } } = mongoose; // ✅ This stays at the top


// Book appointment
const bookAppointment = async (req, res) => {
  try {
    // Validate user exists
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Add user ID validation
    if (!ObjectId.isValid(req.user._id)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const { petName, ownerName, email, date, time, reason } = req.body;
    
    // Create appointment with user reference
    const appointment = new VetAppointment({
      user: req.user._id, 
      petName,
      ownerName,
      email,
      date: new Date(date).toISOString().split('T')[0], // Ensure date format
      time,
      reason
    });
    await appointment.save();

    // Immediate email confirmation
    console.log('=== Attempting to send confirmation email ===');
    const mailOptions = {
      from: `"Vet Appointments" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `✅ ${petName}'s Appointment Confirmed`,
      text: `Hello ${ownerName},\n\n${petName}'s vet appointment is confirmed for:\n📅 Date: ${date}\n⏰ Time: ${time}\n\nVideo call link: https://meet.google.com/abc-xyz-123\n\nReason: ${reason}`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="color: #4CAF50;">Appointment Confirmed!</h2>
          <p>Hello ${ownerName},</p>
          <p><strong>${petName}'s</strong> vet appointment details:</p>
          <ul>
            <li>📅 <strong>Date:</strong> ${date}</li>
            <li>⏰ <strong>Time:</strong> ${time}</li>
            <li>📝 <strong>Reason:</strong> ${reason}</li>
          </ul>
          <p>Join video call: <a href="https://meet.google.com/abc-xyz-123">Click here</a></p>
          <p>We look forward to seeing you!</p>
        </div>
      `
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`📩 Confirmation email sent to: ${email}`, info.messageId);
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      // Consider adding error monitoring here
    }

    res.status(201).json({ message: 'Appointment booked successfully' });
  } catch (error) {
    console.error('❌ Database save failed:', error);
    res.status(500).json({ 
      error: 'Failed to book appointment',
      details: error.message 
    });
  }
};

// Unified getAppointments controller
const getAppointments = async (req, res) => {
  
  try {
    // Validate user ID format using Mongoose ObjectId
    if (!ObjectId.isValid(req.user._id)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    console.log(`Fetching appointments for user: ${req.user._id}`);
    const appointments = await VetAppointment.find({ user: req.user._id })
    .sort({ date: 1 })
    .lean();
    console.log('Appointments found:', appointments.length);

    // Convert MongoDB date to ISO string
    const formattedAppointments = appointments.map(appt => ({
      ...appt,
      date: new Date(appt.date).toISOString().split('T')[0]
    }));

    res.status(200).json(formattedAppointments);


  } catch (error) {
    console.error('Full error:', error); // Log entire error object
    res.status(500).json({ error: 'Failed to retrieve appointments' });
  }
};

// Cron job logic (Fixed email reminder)
const checkAndSendEmails = async () => {
  console.log('⏰ Checking appointments and sending reminders...');
  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const upcomingAppointments = await VetAppointment.find({
      date: { 
        $gte: now,
        $lte: tomorrow 
      },
      reminderSent: { $ne: true } // Only unsent reminders
    });

    for (const appointment of upcomingAppointments) {
      try {
        const mailOptions = {
          from: `"Vet Reminders" <${process.env.EMAIL_USER}>`,
          to: appointment.email,
          subject: `⏰ Reminder: ${appointment.petName}'s Vet Appointment`,
          html: `
            <div style="font-family: Arial, sans-serif;">
              <h3 style="color: #2196F3;">Appointment Reminder</h3>
              <p>Hello ${appointment.ownerName},</p>
              <p><strong>${appointment.petName}'s</strong> appointment details:</p>
              <ul>
                <li>📅 Date: ${appointment.date.toLocaleDateString()}</li>
                <li>⏰ Time: ${appointment.time}</li>
                <li>📝 Reason: ${appointment.reason}</li>
              </ul>
              <p>Video call link: <a href="https://meet.google.com/your-link">Join Meeting</a></p>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log(`📧 Sent reminder to ${appointment.email}`);
        
        // Mark reminder as sent
        await VetAppointment.findByIdAndUpdate(appointment._id, { 
          reminderSent: true 
        });
      } catch (emailError) {
        console.error(`❌ Failed to send reminder to ${appointment.email}:`, emailError);
      }
    }
  } catch (error) {
    console.error('❌ Cron job failed:', error);
  }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await VetAppointment.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id  // Ensure user owns the appointment
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to cancel appointment',
      details: error.message
    });
  }
};

module.exports = {
  bookAppointment,
  getAppointments,
  cancelAppointment,
  checkAndSendEmails
};
