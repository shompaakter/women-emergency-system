// backend/testEmail.js
// Run: node testEmail.js
// এটা run করলে তোমার নিজের email-এ একটা test email আসবে

require('dotenv').config();
const { sendOTP, sendSosEmail } = require('./utils/mailer');

async function test() {
  const testEmail = process.env.MAIL_USER; // নিজের email-এ পাঠাচ্ছি

  console.log('🔧 Testing email config...');
  console.log('   MAIL_USER:', process.env.MAIL_USER || '❌ NOT SET');
  console.log('   MAIL_PASS:', process.env.MAIL_PASS ? '✅ Set (' + process.env.MAIL_PASS.length + ' chars)' : '❌ NOT SET');

  // Test 1: OTP email
  try {
    console.log('\n📧 Sending test OTP email...');
    await sendOTP(testEmail, '123456', 'Test User');
    console.log('✅ OTP email sent successfully!');
  } catch (err) {
    console.log('❌ OTP email failed:', err.message);
    if (err.message.includes('Invalid login')) {
      console.log('   → Gmail App Password is wrong. See fix below.');
    }
  }

  // Test 2: SOS email
  try {
    console.log('\n📧 Sending test SOS email...');
    await sendSosEmail({
      toEmail:    testEmail,
      toName:     'Test Contact',
      senderName: 'Shompa Akter',
      location:   'Tilagoar, Sylhet, Bangladesh',
      mapLink:    'https://maps.google.com/?q=24.8949,91.8687',
      sentAt:     new Date().toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' }),
    });
    console.log('✅ SOS email sent successfully!');
  } catch (err) {
    console.log('❌ SOS email failed:', err.message);
  }

  console.log('\n✅ Test complete. Check your inbox at:', testEmail);
}

test();