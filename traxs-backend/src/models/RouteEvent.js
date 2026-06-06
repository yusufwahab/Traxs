const mongoose = require('mongoose');

const routeEventSchema = new mongoose.Schema({
  driverId: { type: String, required: true },
  eventType: {
    type: String,
    enum: ['road_blocked', 'police_checkpoint', 'flooding', 'accident', 'long_queue'],
    required: true
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  description: String,
  timestamp: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

routeEventSchema.index({ location: '2dsphere' });
routeEventSchema.index({ timestamp: -1 });

module.exports = mongoose.model('RouteEvent', routeEventSchema);
