// backend/server.js
// তোমার existing server.js-এ এই routes যোগ করো

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

// ── Routes ────────────────────────────────────────────
const authRoutes   = require('./routes/auth');
const sosRoutes    = require('./routes/sos');
const contactRoutes = require('./routes/contacts');
const reportRoutes = require('./routes/report');   // ← নতুন
const mapRoutes    = require('./routes/map');       // ← নতুন

app.use('/api/auth',     authRoutes);
app.use('/api/sos',      sosRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/report',   reportRoutes);  // ← নতুন
app.use('/api/map',      mapRoutes);     // ← নতুন

// ── MongoDB connect ───────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`✅ Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => console.error('❌ MongoDB error:', err));