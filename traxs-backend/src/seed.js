require('dotenv').config();
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const Driver = require('./models/Driver');
const PassengerEvent = require('./models/PassengerEvent');
const InferredVehicle = require('./models/InferredVehicle');
const RouteEvent = require('./models/RouteEvent');
const MobilitySnapshot = require('./models/MobilitySnapshot');

const CORRIDORS = [
  { id: 'oshodi-ikeja', name: 'Oshodi–Ikeja', center: [3.3488, 6.5568] },
  { id: 'cms-lekki', name: 'CMS–Lekki', center: [3.3841, 6.4541] },
  { id: 'ikorodu-cbd', name: 'Ikorodu–CBD', center: [3.5069, 6.6194] },
  { id: 'ikeja-oshodi', name: 'Ikeja–Oshodi', center: [3.3488, 6.5568] },
  { id: 'lekki-vi', name: 'Lekki–Victoria Island', center: [3.4254, 6.4335] }
];

const DRIVERS_DATA = [
  { phone: '08012340001', park: 'Oshodi', corridor: 0, vehicleType: 'danfo' },
  { phone: '08012340002', park: 'Oshodi', corridor: 0, vehicleType: 'danfo' },
  { phone: '08012340003', park: 'Ikeja', corridor: 1, vehicleType: 'keke' },
  { phone: '08012340004', park: 'Ikeja', corridor: 1, vehicleType: 'danfo' },
  { phone: '08012340005', park: 'CMS', corridor: 2, vehicleType: 'okada' },
  { phone: '08012340006', park: 'CMS', corridor: 2, vehicleType: 'danfo' },
  { phone: '08012340007', park: 'Lekki', corridor: 3, vehicleType: 'keke' },
  { phone: '08012340008', park: 'Lekki', corridor: 3, vehicleType: 'okada' },
  { phone: '08012340009', park: 'Ikorodu', corridor: 4, vehicleType: 'danfo' },
  { phone: '08012340010', park: 'Ikorodu', corridor: 4, vehicleType: 'danfo' }
];

function jitter(coord, amount = 0.005) {
  return coord + (Math.random() - 0.5) * amount;
}

function randomTime(minsAgo) {
  return new Date(Date.now() - Math.random() * minsAgo * 60 * 1000);
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    Driver.deleteMany({}),
    PassengerEvent.deleteMany({}),
    InferredVehicle.deleteMany({}),
    RouteEvent.deleteMany({}),
    MobilitySnapshot.deleteMany({})
  ]);
  console.log('Cleared existing data');

  // Seed 10 drivers
  const drivers = await Driver.insertMany(DRIVERS_DATA.map((d, i) => {
    const corridor = CORRIDORS[d.corridor];
    return {
      driverId: `DRV-SEED-${String(i + 1).padStart(3, '0')}`,
      phoneNumber: d.phone,
      deviceType: i % 2 === 0 ? 'smartphone' : 'feature_phone',
      vehicleType: d.vehicleType,
      homepark: d.park,
      isActive: true,
      sessionStart: randomTime(120),
      currentLocation: {
        type: 'Point',
        coordinates: [jitter(corridor.center[0]), jitter(corridor.center[1])]
      },
      currentRoute: corridor.id,
      tripsToday: Math.floor(Math.random() * 8) + 2,
      earningsToday: (Math.floor(Math.random() * 8) + 2) * 800,
      airtimeEarned: (Math.floor(Math.random() * 5) + 1) * 50
    };
  }));
  console.log(`Seeded ${drivers.length} drivers`);

  // Seed 200 passenger events across 5 corridors (morning rush)
  const passengerEvents = [];
  for (let i = 0; i < 200; i++) {
    const corridor = CORRIDORS[i % 5];
    passengerEvents.push({
      deviceId: `DEVICE-${String(i + 1).padStart(4, '0')}`,
      timestamp: randomTime(60),
      location: {
        type: 'Point',
        coordinates: [jitter(corridor.center[0], 0.003), jitter(corridor.center[1], 0.003)]
      },
      speed: Math.floor(Math.random() * 30) + 10,
      heading: Math.floor(Math.random() * 360),
      motionType: ['bus', 'bus', 'bus', 'motorcycle', 'walking'][i % 5]
    });
  }
  await PassengerEvent.insertMany(passengerEvents);
  console.log(`Seeded ${passengerEvents.length} passenger events`);

  // Seed 5 inferred vehicles
  const vehicles = await InferredVehicle.insertMany(CORRIDORS.map((corridor, i) => ({
    vehicleId: uuidv4(),
    linkedDriverId: drivers[i * 2]?.driverId || null,
    estimatedOccupancy: Math.floor(Math.random() * 10) + 8,
    currentLocation: {
      type: 'Point',
      coordinates: [jitter(corridor.center[0]), jitter(corridor.center[1])]
    },
    assignedRoute: corridor.id,
    status: 'active',
    passengerDeviceIds: Array.from({ length: 10 }, (_, j) => `DEVICE-${i * 10 + j + 1}`),
    lastUpdated: randomTime(5)
  })));
  console.log(`Seeded ${vehicles.length} inferred vehicles`);

  // Seed 2 active route events
  await RouteEvent.insertMany([
    {
      driverId: drivers[0].driverId,
      eventType: 'road_blocked',
      location: { type: 'Point', coordinates: [3.3555, 6.5601] },
      description: 'Road blocked at Oshodi bridge — accident. Use alternative route.',
      isActive: true,
      timestamp: randomTime(30)
    },
    {
      driverId: drivers[4].driverId,
      eventType: 'police_checkpoint',
      location: { type: 'Point', coordinates: [3.3900, 6.4500] },
      description: 'Police checkpoint on CMS–Lekki expressway. Slow movement.',
      isActive: true,
      timestamp: randomTime(20)
    }
  ]);
  console.log('Seeded 2 route events');

  // Seed MobilitySnapshots — last 2 hours, every 5 minutes = 24 snapshots per corridor
  const snapshots = [];
  for (let minutesAgo = 120; minutesAgo >= 0; minutesAgo -= 5) {
    const ts = new Date(Date.now() - minutesAgo * 60 * 1000);
    CORRIDORS.forEach((corridor, i) => {
      const isGhost = i >= 3; // lekki-vi and ikorodu are ghost corridors
      const demandScore = isGhost ? Math.floor(Math.random() * 20) + 75 : Math.floor(Math.random() * 40) + 30;
      const supplyScore = isGhost ? Math.floor(Math.random() * 15) + 5 : Math.floor(Math.random() * 40) + 40;
      const avgOccupancy = Math.floor(Math.random() * 8) + 10;
      snapshots.push({
        timestamp: ts,
        corridorId: corridor.id,
        corridorName: corridor.name,
        passengerMovements: Math.floor(Math.random() * 150) + 50,
        activeVehicles: isGhost ? Math.floor(Math.random() * 2) + 1 : Math.floor(Math.random() * 5) + 3,
        averageOccupancy: avgOccupancy,
        loadFactor: Math.round((avgOccupancy / 18) * 100),
        demandScore,
        supplyScore,
        ghostCorridor: demandScore > 70 && supplyScore < 30
      });
    });
  }
  await MobilitySnapshot.insertMany(snapshots);
  console.log(`Seeded ${snapshots.length} mobility snapshots`);

  console.log('\n✅ Seed complete. TRAXS is ready for demo.');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
