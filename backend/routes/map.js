// backend/routes/map.js
// GET /api/map         → all incidents (filtered, anonymized)
// GET /api/map?type=X  → filtered by incident type

const express        = require('express');
const router         = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Report         = require('../models/Report');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { type } = req.query;

    // Only show reports that have location data and are not pending
    const query = {
      latitude:  { $ne: null, $exists: true },
      longitude: { $ne: null, $exists: true },
      status:    { $in: ['reviewing', 'action_taken', 'resolved', 'police_referred'] },
    };

    if (type && type !== 'all') {
      query.incidentType = type;
    }

    const reports = await Report.find(query)
      .select('incidentType incidentDate latitude longitude severity status')
      .sort({ incidentDate: -1 })
      .limit(200);

    // ── Privacy: fuzz location by ±~500m ──────────────
    const incidents = reports.map(r => ({
      id:           r._id,
      incidentType: r.incidentType,
      date:         r.incidentDate,
      severity:     r.severity || 'medium',
      // offset lat/lng by random ±0.005° (~500m) so exact location is hidden
      lat: r.latitude  + (Math.random() - 0.5) * 0.01,
      lng: r.longitude + (Math.random() - 0.5) * 0.01,
    }));

    // ── Stats ──────────────────────────────────────────
    const now        = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, thisMonth, highSeverity] = await Promise.all([
      Report.countDocuments({ status: { $ne: 'pending' } }),
      Report.countDocuments({ status: { $ne: 'pending' }, createdAt: { $gte: monthStart } }),
      Report.countDocuments({ status: { $ne: 'pending' }, severity: 'high' }),
    ]);

    res.json({ incidents, stats: { total, thisMonth, highSeverity } });

  } catch (err) {
    console.error('Map API error:', err);
    res.status(500).json({ error: 'Failed to load map data' });
  }
});

module.exports = router;