const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const contacts = await Contact.find({ userId: req.user.userId });

    if (contacts.length === 0) {
      return res.status(400).json({ message: 'No trusted contacts found. Please add contacts first.' });
    }

    // Send SMS to each contact via Twilio Verify
    const smsPromises = contacts.map(contact =>
      twilioClient.messages.create({
        body: `🆘 EMERGENCY ALERT: ${user.name} is in danger and needs help immediately! Please contact them at ${user.phone} right away.`,
        from: `+${process.env.TWILIO_MESSAGING_SERVICE_SID}`,
        to: `+88${contact.contactPhone.replace(/^\+?88/, '')}`,
      })
    );

    await Promise.allSettled(smsPromises);

    res.json({ message: 'SOS sent successfully' });
  } catch (err) {
    console.error('SOS error:', err);
    res.status(500).json({ message: 'Failed to send SOS' });
  }
});

router.get('/history', auth, async (req, res) => {
  res.json([]);
});

module.exports = router;