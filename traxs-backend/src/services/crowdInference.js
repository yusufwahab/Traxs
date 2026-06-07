const { v4: uuidv4 } = require('uuid');
const PassengerEvent = require('../models/PassengerEvent');
const InferredVehicle = require('../models/InferredVehicle');
const Driver = require('../models/Driver');
const { broadcast } = require('../utils/websocket');

const CLUSTER_RADIUS_METERS = 100;
const MIN_DEVICE_COUNT = 8;
const HEADING_TOLERANCE_DEGREES = 30;
const SPEED_TOLERANCE_KMH = 10;
const DRIVER_FUSION_RADIUS_METERS = 150;
const LOOKBACK_SECONDS = 60;

const LAGOS_CORRIDORS = [
  { id: 'oshodi-ikeja', name: 'Oshodi–Ikeja', bearing: 320, center: [3.3488, 6.5568] },
  { id: 'cms-lekki', name: 'CMS–Lekki', bearing: 90, center: [3.3841, 6.4541] },
  { id: 'ikorodu-cbd', name: 'Ikorodu–CBD', bearing: 200, center: [3.5069, 6.6194] },
  { id: 'ikeja-oshodi', name: 'Ikeja–Oshodi', bearing: 140, center: [3.3488, 6.5568] },
  { id: 'lekki-vi', name: 'Lekki–Victoria Island', bearing: 270, center: [3.4254, 6.4335] },
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

function haversineMeters([lng1, lat1], [lng2, lat2]) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function runCrowdInference(event) {
  const since = new Date(Date.now() - LOOKBACK_SECONDS * 1000).toISOString();
  const recent = await PassengerEvent.findSince(since);

  const eventCoords = event.location.coordinates;

  const nearby = recent.filter(e => {
    if (!e.location?.coordinates) return false;
    return haversineMeters(eventCoords, e.location.coordinates) <= CLUSTER_RADIUS_METERS;
  });

  if (nearby.length < MIN_DEVICE_COUNT) return;

  const coherent = nearby.filter(e => {
    const hd = headingDiff(e.heading || 0, event.heading || 0);
    const sd = Math.abs((e.speed || 0) - (event.speed || 0));
    return hd <= HEADING_TOLERANCE_DEGREES && sd <= SPEED_TOLERANCE_KMH;
  });

  if (coherent.length < MIN_DEVICE_COUNT) return;

  const corridor = snapToCorridor(event.heading || 0);
  const deviceIds = [...new Set(coherent.map(e => e.deviceId))];

  const twoMinsAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  const activeDrivers = await Driver.findActive();
  const nearbyDriver = activeDrivers.find(d => {
    if (!d.currentLocation?.coordinates) return false;
    return haversineMeters(eventCoords, d.currentLocation.coordinates) <= DRIVER_FUSION_RADIUS_METERS;
  }) || null;

  const existingOnRoute = await InferredVehicle.findActiveOnRoute(corridor.id, twoMinsAgo);
  let vehicle = existingOnRoute[0] || null;

  if (vehicle) {
    vehicle = await InferredVehicle.update(vehicle.vehicleId, {
      estimatedOccupancy: deviceIds.length,
      currentLocation: event.location,
      passengerDeviceIds: deviceIds,
      lastUpdated: new Date().toISOString(),
      ...(nearbyDriver ? { linkedDriverId: nearbyDriver.driverId } : {}),
    });
  } else {
    vehicle = await InferredVehicle.create({
      vehicleId: uuidv4(),
      linkedDriverId: nearbyDriver ? nearbyDriver.driverId : null,
      estimatedOccupancy: deviceIds.length,
      currentLocation: event.location,
      assignedRoute: corridor.id,
      status: 'active',
      passengerDeviceIds: deviceIds,
    });
  }

  await broadcast('vehicle:inferred', {
    vehicleId: vehicle.vehicleId,
    lat: event.location.coordinates[1],
    lng: event.location.coordinates[0],
    occupancy: vehicle.estimatedOccupancy,
    route: corridor.name,
    linkedDriver: vehicle.linkedDriverId,
  });
}

module.exports = { runCrowdInference };
