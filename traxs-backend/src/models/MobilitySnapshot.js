const mongoose = require('mongoose');

const mobilitySnapshotSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  corridorId: { type: String, required: true },
  corridorName: String,
  passengerMovements: { type: Number, default: 0 },
  activeVehicles: { type: Number, default: 0 },
  averageOccupancy: { type: Number, default: 0 },
  loadFactor: { type: Number, default: 0 },
  demandScore: { type: Number, default: 0 },
  supplyScore: { type: Number, default: 0 },
  ghostCorridor: { type: Boolean, default: false }
});

mobilitySnapshotSchema.index({ timestamp: -1 });
mobilitySnapshotSchema.index({ corridorId: 1 });

module.exports = mongoose.model('MobilitySnapshot', mobilitySnapshotSchema);
