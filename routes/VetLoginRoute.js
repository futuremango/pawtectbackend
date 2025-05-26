//C:\Users\Anza\Desktop\NewPawtect7\pawtect\backend\routes\VetLoginRoute.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Vet = require('../models/Vet');
const router = express.Router();

// === Signup Route ===
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingVet = await Vet.findOne({ email });
    if (existingVet) {
      return res.status(400).json({ error: 'Vet already exists' });
    }

    const newVet = new Vet({ email, password });
    await newVet.save();
    res.status(201).json({ message: 'Vet registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// === Login Route ===
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const vet = await Vet.findOne({ email });
    if (!vet) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await vet.matchPassword(password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: vet._id }, 'your_secret_key', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
