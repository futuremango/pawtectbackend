const Donation = require('../models/Donation');
const User = require('../models/User');
const transporter = require('../config/emailConfig');
const stripe = require('stripe')(sk_test_51RLkF5CWd0e1OS3ohXo57W7u9J09OWwefh0MKrDhBma3wDwglZMPY5WG6sYZnNjJk8LyAOMwSbb3Iryh93xfVzSp00xYbElE35);

const currencyConfig = {
  pkr: { minAmount: 50, zeroDecimal: true },
  usd: { minAmount: 100, zeroDecimal: false },
  eur: { minAmount: 100, zeroDecimal: false },
  gbp: { minAmount: 100, zeroDecimal: false }
};

exports.createDonation = async (req, res) => {
  try {
    const { type, amount, currency } = req.body;
    const userId = req.user.id;

    if (!['money', 'item'].includes(type)) {
      return res.status(400).json({ error: 'Invalid donation type' });
    }

    if (type === 'money') {
      if (!amount || amount < 1) {
        return res.status(400).json({ error: 'Invalid donation amount' });
      }

      const currencyLower = currency.toLowerCase();
      const config = currencyConfig[currencyLower];
      
      if (!config) {
        return res.status(400).json({ error: 'Unsupported currency' });
      }

      const amountInSubunits = config.zeroDecimal ? 
        Math.round(amount) : 
        Math.round(amount * 100);

      if (amountInSubunits < config.minAmount) {
        return res.status(400).json({
          error: `Minimum donation for ${currency.toUpperCase()} is ${config.minAmount}`
        });
      }
    }

    if (type === 'item') {
      if (!req.body.items || req.body.items.length === 0) {
        return res.status(400).json({ error: 'At least one item required' });
      }
      
      const invalidItems = req.body.items.filter(item => !item.name);
      if (invalidItems.length > 0) {
        return res.status(400).json({ error: 'All items must have a name' });
      }
    }

    const donationData = {
      user: userId,
      type,
      status: type === 'money' ? 'completed' : 'pending',
      ...req.body
    };

    if (type === 'money') {
      donationData.items = [];
    }

    const donation = await Donation.create(donationData);
    await User.findByIdAndUpdate(userId, { $push: { donations: donation._id } });
    
    res.status(201).json({ success: true, data: donation });

  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getUserDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ user: req.user.id })
      .sort('-createdAt')
      .populate('user', 'name email');
    res.status(200).json({ success: true, data: donations });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.getAllDonations = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (type) query.type = type;

    const donations = await Donation.find(query)
      .sort('-createdAt')
      .populate('user', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Donation.countDocuments(query);
    res.status(200).json({ 
      success: true,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: donations
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.updateDonationStatus = async (req, res) => {
  try {
    const { status, adminMessage } = req.body;
    const donation = await Donation.findById(req.params.id)
      .populate('user');

    if (!donation) return res.status(404).json({ error: 'Donation not found' });
    
    donation.status = status;
    await donation.save();

    await this.sendDonationEmail(
      donation, 
      status, 
      adminMessage || 'Status updated - please contact us for details'
    );

    res.status(200).json({ success: true, data: donation });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.sendDonationEmail = async (donation, status, adminMessage) => {
  try {
    if (!donation.user?.email) {
      console.error('No email found for user:', donation.user._id);
      return;
    }

    const statusMessages = {
      approved: {
        subject: 'Donation Approved 🎉',
        color: '#4CAF50',
        statusText: 'approved'
      },
      rejected: {
        subject: 'Donation Rejected ❌',
        color: '#F44336',
        statusText: 'rejected'
      },
      pending: {
        subject: 'Donation Update ⚠️',
        color: '#FFC107',
        statusText: 'updated'
      }
    };

    const { subject, color, statusText } = statusMessages[status] || {};
    
    const mailOptions = {
      from: `"Pawtect Donations" <${process.env.EMAIL_USER}>`,
      to: donation.user.email,
      subject: subject || 'Donation Status Update',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid ${color}; padding-bottom: 10px;">
            Donation ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}
          </h2>
          
          <div style="margin: 20px 0;">
            <p>Your ${donation.type} donation has been:</p>
            <h3 style="color: ${color}; margin: 10px 0; padding: 10px; background: ${color}10; border-radius: 5px;">
              ${status.toUpperCase()}
            </h3>
          </div>

          ${donation.type === 'money' ? `
            <p><strong>Amount:</strong> ${donation.amount} ${donation.currency}</p>
          ` : `
            <p><strong>Items:</strong> ${donation.items.map(item => `${item.name} (${item.quantity})`).join(', ')}</p>
          `}

          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0;">Admin Message:</h4>
            <p style="white-space: pre-line; margin: 0;">${adminMessage}</p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p>Need help? Contact our support team:</p>
            <p>📧 support@pawtect.org | 📞 +1 (555) 123-4567</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Donation email sent to:', donation.user.email);
  } catch (error) {
    console.error('Failed to send donation email:', error);
    throw error;
  }
};

exports.deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) return res.status(404).json({ error: 'Donation not found' });
    if (donation.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await donation.remove();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const currencyLower = currency.toLowerCase();
    const config = currencyConfig[currencyLower];

    if (!config) {
      return res.status(400).json({ error: 'Unsupported currency' });
    }

    const amountInSubunits = config.zeroDecimal ? 
      Math.round(amount) : 
      Math.round(amount * 100);

    if (amountInSubunits < config.minAmount) {
      return res.status(400).json({
        error: `Minimum donation for ${currency.toUpperCase()} is ${config.minAmount}`
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSubunits,
      currency: currencyLower,
      automatic_payment_methods: { enabled: true },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
