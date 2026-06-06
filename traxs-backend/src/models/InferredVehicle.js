const mongoose = require('mongoose');

const inferredVehicleSchema = new mongoose.Schema({
  vehicleId: { type: String, unique: true, required: true },
  linkedDriverId: { type: String, default: null },
  estimatedOccupancy: { type: Number, default: 0 },
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  assignedRoute: String,
  status: { type: String, enum: ['active', 'idle', 'lost'], default: 'active' },
  passengerDeviceIds: [String],
  lastUpdated: { type: Date, default: Date.now }
});

inferredVehicleSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('InferredVehicle', inferredVehicleSchema);
