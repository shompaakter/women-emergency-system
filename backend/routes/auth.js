const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');

const otpStore = new Map();

const twilio = require('twilio');
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const VERIFY_SID = process.env.TWILIO_VERIFY_SID;

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/send-otp
// ─────────────────────────────────────────────────────────────────────────────
router.post('/send-otp', async (req, res) => {
  try {
    const { phone, email, name } = req.body;

    if (!phone || !email || !name) {
      return res.status(400).json({ message: 'Name, email, and phone are required.' });
    }

    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(409).json({ message: 'This phone number is already registered.' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: 'This email is already registered.' });
    }

    // Store name & email temporarily
    otpStore.set(phone, { name, email });

    const cleanPhone = `+88${phone.replace(/^\+?88/, '')}`;

    await twilioClient.verify.v2.services(VERIFY_SID)
      .verifications.create({ to: cleanPhone, channel: 'sms' });

    res.json({ message: 'OTP sent successfully.' });
  } catch (err) {
    console.error('send-otp error:', err);
    res.status(500).json({ message: 'Failed to send OTP. Try again.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, otp } = req.body;

    if (!name || !email || !phone || !password || !otp) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const cleanPhone = `+88${phone.replace(/^\+?88/, '')}`;

    // Verify OTP via Twilio
    const verification = await twilioClient.verify.v2.services(VERIFY_SID)
      .verificationChecks.create({ to: cleanPhone, code: otp });

    if (verification.status !== 'approved') {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    otpStore.delete(phone);

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      isVerified: true,
    });
    await user.save();

    res.status(201).json({ message: 'Account created successfully. Please log in.' });
  } catch (err) {
    console.error('register error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Phone or email already registered.' });
    }
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: 'Phone and password are required.' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ message: 'Invalid phone number or password.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Account not verified. Please register again.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid phone number or password.' });
    }

    const token = jwt.sign(
      { userId: user._id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

module.exports = router;