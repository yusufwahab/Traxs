const mongoose = require('mongoose');

const passengerEventSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  speed: Number,
  heading: Number,
  motionType: { type: String, enum: ['walking', 'bus', 'motorcycle', 'stationary'] }
});

passengerEventSchema.index({ location: '2dsphere' });
passengerEventSchema.index({ timestamp: -1 });

module.exports = mongoose.model('PassengerEvent', passengerEventSchema);
