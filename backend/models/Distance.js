// models/Distance.js
const mongoose = require('mongoose');

const distanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: String }, // e.g., "2025-06-10"
  totalDistance: Number,  // in kilometers
});

module.exports = mongoose.model('Distance', distanceSchema);
