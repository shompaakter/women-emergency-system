// backend/routes/sos.js
// POST /api/sos         → SOS trigger — email to all trusted contacts
// GET  /api/sos/history → user's alert history
// Twilio নেই — শুধু Nodemailer দিয়ে email

const express        = require('express');
const router         = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User           = require('../models/User');
const Contact        = require('../models/Contact');
const SosAlert       = require('../models/SosAlert');
const { sendSosEmail } = require('../utils/mailer');

// ═══════════════════════════════════════════════════════
// POST /api/sos
// ═══════════════════════════════════════════════════════
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Invalid token payload' });

    // 1. Get user
    const user = await User.findById(userId).select('name phone email');
    if (!user) return res.status(404).json({ error: 'User not found' });

    // 2. Build location
    const mapLink = (latitude && longitude)
      ? `https://maps.google.com/?q=${latitude},${longitude}`
      : '';

    const locationText = address
      || (latitude && longitude ? `Lat: ${latitude}, Lng: ${longitude}` : 'Location unavailable');

    const sentAt = new Date().toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' });

    console.log(`\n🆘 SOS TRIGGERED`);
    console.log(`   User    : ${user.name} (${user.phone || 'no phone'})`);
    console.log(`   Location: ${locationText}`);
    console.log(`   Map link: ${mapLink || 'N/A'}`);

    // 3. Save to DB
    const alert = await SosAlert.create({
      user:      userId,
      latitude:  latitude  || null,
      longitude: longitude || null,
      address:   locationText,
      mapLink,
      status:    'active',
    });

    // 4. Get trusted contacts
    const contacts = await Contact.find({ user: userId });
    console.log(`   Contacts: ${contacts.length} found`);

    if (contacts.length === 0) {
      await SosAlert.findByIdAndUpdate(alert._id, { status: 'sent' });
      return res.json({
        success:    true,
        alertId:    alert._id,
        emailSent:  0,
        message:    'SOS saved. No trusted contacts found — add contacts in dashboard.',
      });
    }

    // 5. Send email to each contact
    let emailSent = 0;

    for (const contact of contacts) {
      console.log(`\n   📤 Sending to: ${contact.contactName} (${contact.email || 'no email'})`);

      if (!contact.email) {
        console.log(`   ⚠️  No email for ${contact.contactName} — skipped`);
        continue;
      }

      try {
        await sendSosEmail({
          toEmail:     contact.email,
          toName:      contact.contactName,
          senderName:  user.name,
          senderPhone: user.phone || '',
          location:    locationText,
          mapLink:     mapLink || null,
          sentAt,
        });
        emailSent++;
        console.log(`   ✅ Email sent to ${contact.contactName}`);
      } catch (err) {
        console.log(`   ❌ Email FAILED for ${contact.contactName}: ${err.message}`);
      }
    }

    // 6. Update DB
    await SosAlert.findByIdAndUpdate(alert._id, { emailSent, status: 'sent' });

    console.log(`\n📊 SOS DONE — Emails: ${emailSent}/${contacts.filter(c => c.email).length}\n`);

    res.json({
      success:   true,
      alertId:   alert._id,
      emailSent,
      mapLink,
      message:   `SOS sent — ${emailSent} email${emailSent !== 1 ? 's' : ''} delivered`,
    });

  } catch (err) {
    console.error('❌ SOS ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════
// GET /api/sos/history
// ═══════════════════════════════════════════════════════
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Invalid token payload' });

    const alerts = await SosAlert.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('address mapLink emailSent status createdAt');

    res.json({ alerts });
  } catch (err) {
    console.error('HISTORY ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;