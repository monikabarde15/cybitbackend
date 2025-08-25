// models/Contact.js
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  firstName: String,
  email: String,
  phone: String,
  service: String,
  message: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contact', contactSchema);
