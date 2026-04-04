const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contactName: { type: String, required: true },
  contactPhone: { type: String, required: true },
  relation: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);