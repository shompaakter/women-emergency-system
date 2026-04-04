const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const jwt = require('jsonwebtoken');

// Auth middleware
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

// GET all contacts
router.get('/', auth, async (req, res) => {
  const contacts = await Contact.find({ userId: req.user.userId });
  res.json(contacts);
});

// POST add contact
router.post('/', auth, async (req, res) => {
  const { contactName, contactPhone, relation } = req.body;
  if (!contactName || !contactPhone || !relation) {
    return res.status(400).json({ message: 'All fields required' });
  }
  const contact = new Contact({ userId: req.user.userId, contactName, contactPhone, relation });
  await contact.save();
  res.status(201).json(contact);
});

// PUT update contact
router.put('/:id', auth, async (req, res) => {
  const contact = await Contact.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.userId },
    req.body,
    { new: true }
  );
  if (!contact) return res.status(404).json({ message: 'Not found' });
  res.json(contact);
});

// DELETE contact
router.delete('/:id', auth, async (req, res) => {
  await Contact.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
  res.json({ message: 'Deleted' });
});

module.exports = router;