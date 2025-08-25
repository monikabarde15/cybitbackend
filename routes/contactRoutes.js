// routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

router.post('/', async (req, res) => {
  try {
    const { firstName, email, phone, message } = req.body;

    // Optional: Basic validation
    if (!firstName  || !email || !message) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newContact = new Contact({ firstName, email, phone, message });
    await newContact.save();

    res.status(201).json({ success: true, message: 'Data saved successfully' });
  } catch (error) {
    console.error('❌ Backend Error:', error); // <-- PRINT actual error
    res.status(500).json({ success: false, message: 'Error saving data', error: error.message });
  }
});

module.exports = router;
