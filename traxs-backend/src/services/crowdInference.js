const { v4: uuidv4 } = require('uuid');
const PassengerEvent = require('../models/PassengerEvent');
const InferredVehicle = require('../models/InferredVehicle');
const Driver = require('../models/Driver');

// Tunable constants
const CLUSTER_RADIUS_METERS = 100;
const MIN_DEVICE_COUNT = 8;
const HEADING_TOLERANCE_DEGREES = 30;
const SPEED_TOLERANCE_KMH = 10;
const DRIVER_FUSION_RADIUS_METERS = 150;
const LOOKBACK_SECONDS = 60;

// Known Lagos corridors for route snapping
const LAGOS_CORRIDORS = [
  { id: 'oshodi-ikeja', name: 'Oshodi–Ikeja', bearing: 320, center: [3.3488, 6.5568] },
  { id: 'cms-lekki', name: 'CMS–Lekki', bearing: 90, center: [3.3841, 6.4541] },
  { id: 'ikorodu-cbd', name: 'Ikorodu–CBD', bearing: 200, center: [3.5069, 6.6194] },
  { id: 'ikeja-oshodi', name: 'Ikeja–Oshodi', bearing: 140, center: [3.3488, 6.5568] },
  { id: 'lekki-vi', name: 'Lekki–Victoria Island', bearing: 270, center: [3.4254, 6.4335] }
];

function headingDiff(a, b) {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function snapToCorridor(heading) {
  let best = LAGOS_CORRIDORS[0];
  let bestDiff = 360;
  for (const corridor of LAGOS_CORRIDORS) {
    const diff = headingDiff(heading, corridor.bearing);
    if (diff < bestDiff) { bestDiff = diff; best = corridor; }
  }
  return best;
}

async function runCrowdInference(event, io) {
  const since = new Date(Date.now() - LOOKBACK_SECONDS * 1000);

  const nearby = await PassengerEvent.find({
    timestamp: { $gte: since },
    location: {
      $nearSphere: {
        $geometry: { type: 'Point', coordinates: event.location.coordinates },
        $maxDistance: CLUSTER_RADIUS_METERS
      }
    }
  });

  if (nearby.length < MIN_DEVICE_COUNT) return;

  // Filter by heading and speed coherence relative to this event
  const coherent = nearby.filter(e => {
    const hd = headingDiff(e.heading || 0, event.heading || 0);
    const sd = Math.abs((e.speed || 0) - (event.speed || 0));
    return hd <= HEADING_TOLERANCE_DEGREES && sd <= SPEED_TOLERANCE_KMH;
  });

  if (coherent.length < MIN_DEVICE_COUNT) return;

  const corridor = snapToCorridor(event.heading || 0);
  const deviceIds = [...new Set(coherent.map(e => e.deviceId))];

  // Check for driver fusion within 150m
  const nearbyDriver = await Driver.findOne({
    isActive: true,
    currentLocation: {
      $nearSphere: {
        $geometry: { type: 'Point', coordinates: event.location.coordinates },
        $maxDistance: DRIVER_FUSION_RADIUS_METERS
      }
    }
  });

  // Upsert InferredVehicle — find existing one on same corridor updated recently
  let vehicle = await InferredVehicle.findOne({
    assignedRoute: corridor.id,
    status: 'active',
    lastUpdated: { $gte: new Date(Date.now() - 2 * 60 * 1000) }
  });

  if (vehicle) {
    vehicle.estimatedOccupancy = deviceIds.length;
    vehicle.currentLocation = event.location;
    vehicle.passengerDeviceIds = deviceIds;
    vehicle.lastUpdated = new Date();
    if (nearbyDriver) vehicle.linkedDriverId = nearbyDriver.driverId;
    await vehicle.save();
  } else {
    vehicle = await InferredVehicle.create({
      vehicleId: uuidv4(),
      linkedDriverId: nearbyDriver ? nearbyDriver.driverId : null,
      estimatedOccupancy: deviceIds.length,
      currentLocation: event.location,
      assignedRoute: corridor.id,
      status: 'active',
      passengerDeviceIds: deviceIds,
      lastUpdated: new Date()
    });
  }

  if (io) {
    io.emit('vehicle:inferred', {
      vehicleId: vehicle.vehicleId,
      lat: event.location.coordinates[1],
      lng: event.location.coordinates[0],
      occupancy: vehicle.estimatedOccupancy,
      route: corridor.name,
      linkedDriver: vehicle.linkedDriverId
    });
  }
}

module.exports = { runCrowdInference };
