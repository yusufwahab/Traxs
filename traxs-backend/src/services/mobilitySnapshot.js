const cron = require('node-cron');
const PassengerEvent = require('../models/PassengerEvent');
const InferredVehicle = require('../models/InferredVehicle');
const MobilitySnapshot = require('../models/MobilitySnapshot');

const CORRIDORS = [
  { id: 'oshodi-ikeja', name: 'Oshodi–Ikeja' },
  { id: 'cms-lekki', name: 'CMS–Lekki' },
  { id: 'ikorodu-cbd', name: 'Ikorodu–CBD' },
  { id: 'ikeja-oshodi', name: 'Ikeja–Oshodi' },
  { id: 'lekki-vi', name: 'Lekki–Victoria Island' }
];

async function takeSnapshot(io) {
  const since = new Date(Date.now() - 5 * 60 * 1000);

  for (const corridor of CORRIDORS) {
    const [passengerEvents, activeVehicles] = await Promise.all([
      PassengerEvent.countDocuments({ timestamp: { $gte: since } }),
      InferredVehicle.find({ assignedRoute: corridor.id, status: 'active' })
    ]);

    const vehicleCount = activeVehicles.length;
    const avgOccupancy = vehicleCount
      ? activeVehicles.reduce((sum, v) => sum + v.estimatedOccupancy, 0) / vehicleCount
      : 0;

    const demandScore = Math.min(100, Math.round((passengerEvents / 200) * 100));
    const supplyScore = Math.min(100, Math.round((vehicleCount / 10) * 100));
    const loadFactor = avgOccupancy > 0 ? Math.min(100, Math.round((avgOccupancy / 18) * 100)) : 0;
    const ghostCorridor = demandScore > 70 && supplyScore < 30;

    const snapshot = await MobilitySnapshot.create({
      corridorId: corridor.id,
      corridorName: corridor.name,
      passengerMovements: passengerEvents,
      activeVehicles: vehicleCount,
      averageOccupancy: Math.round(avgOccupancy),
      loadFactor,
      demandScore,
      supplyScore,
      ghostCorridor
    });

    if (io) {
      io.emit('snapshot:updated', {
        corridorId: corridor.id,
        loadFactor,
        demandScore,
        ghostCorridor
      });
    }
  }
}

function startSnapshotCron(io) {
  cron.schedule('*/5 * * * *', () => {
    takeSnapshot(io).catch(err => console.error('Snapshot cron error:', err));
  });
  console.log('Mobility snapshot cron started (every 5 minutes)');
}

module.exports = { startSnapshotCron, takeSnapshot };
