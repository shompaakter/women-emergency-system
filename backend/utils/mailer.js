// backend/utils/mailer.js

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// ── 1. OTP Email (Registration + Forgot Password) ─────
const sendOTP = async (toEmail, otp, name) => {
  await transporter.sendMail({
    from:    `"SafeHer" <${process.env.MAIL_USER}>`,
    to:      toEmail,
    subject: `${otp} is your SafeHer verification code`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;border-radius:16px;overflow:hidden;border:1px solid #fce7f3">
        <div style="background:#ec4899;padding:28px 32px">
          <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700">SafeHer</h1>
          <p style="color:#fce7f3;margin:4px 0 0;font-size:13px">Women Safety Platform</p>
        </div>
        <div style="padding:32px;background:#fff">
          <p style="color:#111827;font-size:15px;margin:0 0 24px">Hi <strong>${name || 'there'}</strong> 👋, your verification code is:</p>
          <div style="background:#fdf2f8;border:2px dashed #f9a8d4;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
            <p style="font-size:42px;font-weight:700;letter-spacing:10px;color:#ec4899;margin:0;font-family:monospace">${otp}</p>
          </div>
          <p style="color:#6b7280;font-size:13px;margin:0 0 6px">⏱️ Expires in <strong>5 minutes</strong>.</p>
          <p style="color:#9ca3af;font-size:12px;margin:0">If you didn't request this, ignore this email.</p>
        </div>
        <div style="padding:14px 32px;background:#fdf2f8;border-top:1px solid #fce7f3">
          <p style="color:#d1d5db;font-size:11px;margin:0;text-align:center">© SafeHer — Women Safety Platform, Bangladesh</p>
        </div>
      </div>
    `,
  });
};

// ── 2. SOS Alert Email (to trusted contacts) ──────────
const sendSosEmail = async ({ toEmail, toName, senderName, location, mapLink, sentAt }) => {
  const displayTime = sentAt || new Date().toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' });
  await transporter.sendMail({
    from:    `"SafeHer Emergency" <${process.env.MAIL_USER}>`,
    to:      toEmail,
    subject: `🆘 EMERGENCY: ${senderName} needs help RIGHT NOW`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;border-radius:16px;overflow:hidden;border:2px solid #fca5a5">
        <div style="background:#dc2626;padding:24px 28px">
          <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700">🆘 Emergency Alert</h1>
          <p style="color:#fee2e2;margin:6px 0 0;font-size:13px">Sent via SafeHer — Women Safety Platform</p>
        </div>
        <div style="padding:28px;background:#fff">
          <p style="color:#111827;font-size:15px;margin:0 0 16px">Hi <strong>${toName || 'there'}</strong>,</p>
          <p style="color:#111827;font-size:15px;margin:0 0 20px;line-height:1.7">
            <strong style="color:#dc2626">${senderName}</strong> has triggered an <strong>emergency SOS alert</strong> and needs your help immediately.
          </p>
          <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:10px;padding:18px;margin-bottom:20px">
            <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#991b1b">📍 Last known location</p>
            <p style="margin:0 0 14px;font-size:14px;color:#374151">${location || 'Location not available'}</p>
            ${mapLink
              ? `<a href="${mapLink}" style="display:inline-block;background:#dc2626;color:#fff;padding:10px 22px;border-radius:999px;text-decoration:none;font-size:13px;font-weight:600">📍 Open in Google Maps →</a>`
              : `<p style="font-size:12px;color:#9ca3af;margin:0">GPS location not available</p>`}
          </div>
          <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:18px;margin-bottom:24px">
            <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#166534">✅ What to do right now</p>
            <ol style="margin:0;padding-left:18px;font-size:13px;color:#374151;line-height:2.2">
              <li>Call <strong>${senderName}</strong> immediately</li>
              <li>If no answer — go to her location or send someone</li>
              <li>Call emergency services: <strong style="color:#dc2626">999</strong></li>
            </ol>
          </div>
          <p style="font-size:12px;color:#9ca3af;margin:0">Alert sent at: <strong>${displayTime}</strong></p>
        </div>
        <div style="padding:14px 28px;background:#fef2f2;border-top:1px solid #fca5a5">
          <p style="color:#d1d5db;font-size:11px;margin:0;text-align:center">© SafeHer — Women Safety Platform, Bangladesh</p>
        </div>
      </div>
    `,
  });
};

// ── 3. New Report Notification (to admin/team) ────────
const sendNewReportEmail = async ({ reportCode, incidentType, location, isAnonymous }) => {
  await transporter.sendMail({
    from:    `"SafeHer Reports" <${process.env.MAIL_USER}>`,
    to:      process.env.MAIL_USER,
    subject: `📋 New Report — ${reportCode}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:28px;background:#fff;border-radius:12px;border:1px solid #f9a8d4">
        <h2 style="color:#ec4899;margin:0 0 16px">New Incident Report</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:8px 0;color:#6b7280;width:140px">Report Code</td>
              <td style="padding:8px 0;font-weight:600;font-family:monospace;color:#111827">${reportCode}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">Incident Type</td>
              <td style="padding:8px 0;color:#111827;text-transform:capitalize">${incidentType}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">Location</td>
              <td style="padding:8px 0;color:#111827">${location || 'Not provided'}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">Anonymous</td>
              <td style="padding:8px 0;color:#111827">${isAnonymous ? 'Yes' : 'No — contact info provided'}</td></tr>
        </table>
      </div>
    `,
  });
};

module.exports = { sendOTP, sendSosEmail, sendNewReportEmail };