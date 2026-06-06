const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  driverId: { type: String, unique: true, required: true },
  phoneNumber: String,
  deviceType: { type: String, enum: ['feature_phone', 'smartphone'] },
  vehicleType: { type: String, enum: ['danfo', 'keke', 'okada'] },
  homepark: String,
  isActive: { type: Boolean, default: false },
  sessionStart: Date,
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  currentRoute: String,
  tripsToday: { type: Number, default: 0 },
  earningsToday: { type: Number, default: 0 },
  airtimeEarned: { type: Number, default: 0 }
});

driverSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Driver', driverSchema);
