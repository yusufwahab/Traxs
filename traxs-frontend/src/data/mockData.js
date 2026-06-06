export const MOCK_DRIVERS = [
  { driverId: 'd001', phoneNumber: '08012345678', vehicleType: 'danfo', homePark: 'Oshodi', isActive: true, lat: 6.5568, lng: 3.3486, currentRoute: 'Oshodi → Ikeja', tripsToday: 7, earningsToday: 14000 },
  { driverId: 'd002', phoneNumber: '08023456789', vehicleType: 'keke',  homePark: 'Ikeja',   isActive: true, lat: 6.6018, lng: 3.3515, currentRoute: 'Ikeja → CMS',    tripsToday: 5, earningsToday: 9500  },
  { driverId: 'd003', phoneNumber: '08034567890', vehicleType: 'danfo', homePark: 'CMS',    isActive: true, lat: 6.4541, lng: 3.3947, currentRoute: 'CMS → Lekki',    tripsToday: 9, earningsToday: 18000 },
  { driverId: 'd004', phoneNumber: '08045678901', vehicleType: 'okada', homePark: 'Lekki',  isActive: true, lat: 6.4698, lng: 3.5852, currentRoute: 'Lekki → Ajah',   tripsToday: 12, earningsToday: 22000 },
  { driverId: 'd005', phoneNumber: '08056789012', vehicleType: 'danfo', homePark: 'Ikorodu',isActive: true, lat: 6.6194, lng: 3.5060, currentRoute: 'Ikorodu → Owutu', tripsToday: 4, earningsToday: 8000  },
  { driverId: 'd006', phoneNumber: '08067890123', vehicleType: 'keke',  homePark: 'Surulere',isActive: true,lat: 6.5022, lng: 3.3603, currentRoute: 'Surulere → VI',  tripsToday: 8, earningsToday: 15000 },
  { driverId: 'd007', phoneNumber: '08078901234', vehicleType: 'danfo', homePark: 'Ojota',  isActive: true, lat: 6.5833, lng: 3.3833, currentRoute: 'Ojota → Oshodi',  tripsToday: 6, earningsToday: 11000 },
];

export const MOCK_INFERRED_VEHICLES = [
  { vehicleId: 'v001', linkedDriverId: 'd001', estimatedOccupancy: 14, lat: 6.5600, lng: 3.3500, assignedRoute: 'Oshodi → Ikeja' },
  { vehicleId: 'v002', linkedDriverId: 'd003', estimatedOccupancy: 11, lat: 6.4600, lng: 3.4000, assignedRoute: 'CMS → Lekki'    },
  { vehicleId: 'v003', linkedDriverId: null,   estimatedOccupancy: 8,  lat: 6.5100, lng: 3.3700, assignedRoute: 'Surulere → VI'  },
  { vehicleId: 'v004', linkedDriverId: 'd005', estimatedOccupancy: 16, lat: 6.6200, lng: 3.5100, assignedRoute: 'Ikorodu → Owutu'},
  { vehicleId: 'v005', linkedDriverId: null,   estimatedOccupancy: 6,  lat: 6.4700, lng: 3.5900, assignedRoute: 'Lekki → Ajah'   },
];

export const MOCK_ROUTE_EVENTS = [
  { id: 're001', eventType: 'Road Block',        lat: 6.5900, lng: 3.3400, location: 'Apapa Expressway',     description: 'Major accident blocking 3 lanes',              timestamp: new Date(Date.now() - 1200000).toISOString() },
  { id: 're002', eventType: 'Police Checkpoint', lat: 6.4650, lng: 3.5800, location: 'Lekki-Epe Expressway', description: 'Checkpoint slowing traffic significantly',        timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 're003', eventType: 'Flooding',          lat: 6.5000, lng: 3.3550, location: 'Surulere Underpass',   description: 'Flooded road, vehicles diverting',               timestamp: new Date(Date.now() - 900000).toISOString()  },
];

export const MOCK_CORRIDORS = [
  { id: 'c1', name: 'Ikorodu → Owutu',  demandScore: 94, supplyScore: 18, loadFactor: 91, dailyMovements: 40000, avgOccupancy: 16, revenueEstimate: 6800000, viabilityScore: 92, ghostCorridor: true  },
  { id: 'c2', name: 'Oshodi → Ikeja',   demandScore: 88, supplyScore: 42, loadFactor: 76, dailyMovements: 31000, avgOccupancy: 14, revenueEstimate: 4200000, viabilityScore: 85, ghostCorridor: true  },
  { id: 'c3', name: 'Ikeja → CMS',      demandScore: 85, supplyScore: 60, loadFactor: 78, dailyMovements: 19200, avgOccupancy: 14, revenueEstimate: 4500000, viabilityScore: 80, ghostCorridor: false },
  { id: 'c4', name: 'Surulere → VI',    demandScore: 83, supplyScore: 55, loadFactor: 73, dailyMovements: 22000, avgOccupancy: 13, revenueEstimate: 3800000, viabilityScore: 78, ghostCorridor: false },
  { id: 'c5', name: 'CMS → Lekki',      demandScore: 79, supplyScore: 61, loadFactor: 68, dailyMovements: 18700, avgOccupancy: 12, revenueEstimate: 3100000, viabilityScore: 71, ghostCorridor: false },
  { id: 'c6', name: 'Ojota → Oshodi',   demandScore: 76, supplyScore: 38, loadFactor: 70, dailyMovements: 16800, avgOccupancy: 13, revenueEstimate: 3200000, viabilityScore: 74, ghostCorridor: true  },
  { id: 'c7', name: 'Lekki → Ajah',     demandScore: 71, supplyScore: 49, loadFactor: 65, dailyMovements: 14500, avgOccupancy: 11, revenueEstimate: 2700000, viabilityScore: 66, ghostCorridor: false },
];

export const MOCK_LGA_DATA = [
  { name: 'Lagos Island',  healthScore: 42, vehicles: 87,  movements: 48000, population: 210000, transitAccessScore: 38, trend: [30, 33, 36, 38, 40, 42] },
  { name: 'Ikeja',         healthScore: 68, vehicles: 134, movements: 72000, population: 313000, transitAccessScore: 65, trend: [55, 58, 62, 64, 66, 68] },
  { name: 'Surulere',      healthScore: 55, vehicles: 98,  movements: 54000, population: 280000, transitAccessScore: 52, trend: [44, 47, 50, 52, 53, 55] },
  { name: 'Lekki',         healthScore: 61, vehicles: 76,  movements: 41000, population: 195000, transitAccessScore: 58, trend: [50, 53, 55, 57, 59, 61] },
  { name: 'Ikorodu',       healthScore: 31, vehicles: 44,  movements: 28000, population: 535000, transitAccessScore: 29, trend: [25, 26, 28, 29, 30, 31] },
  { name: 'Oshodi-Isolo',  healthScore: 49, vehicles: 112, movements: 63000, population: 370000, transitAccessScore: 46, trend: [40, 42, 44, 46, 47, 49] },
  { name: 'Kosofe',        healthScore: 37, vehicles: 52,  movements: 31000, population: 288000, transitAccessScore: 34, trend: [28, 30, 32, 33, 35, 37] },
  { name: 'Alimosho',      healthScore: 28, vehicles: 41,  movements: 38000, population: 490000, transitAccessScore: 25, trend: [20, 22, 24, 25, 27, 28] },
];

export const MOCK_HOURLY_MOVEMENTS = [
  { hour: '5am',  movements: 8200  },
  { hour: '6am',  movements: 24500 },
  { hour: '7am',  movements: 48900 },
  { hour: '8am',  movements: 67400 },
  { hour: '9am',  movements: 52100 },
  { hour: '10am', movements: 38700 },
  { hour: '11am', movements: 31200 },
  { hour: '12pm', movements: 29800 },
  { hour: '1pm',  movements: 33400 },
  { hour: '2pm',  movements: 28900 },
  { hour: '3pm',  movements: 35600 },
  { hour: '4pm',  movements: 51200 },
  { hour: '5pm',  movements: 71800 },
  { hour: '6pm',  movements: 68300 },
  { hour: '7pm',  movements: 44100 },
  { hour: '8pm',  movements: 22600 },
];

export const MOCK_GHOST_CORRIDOR_POLYLINES = [
  // Ikorodu → Owutu
  { corridorId: 'c1', name: 'Ikorodu → Owutu',  polyline: [[6.6194,3.5060],[6.6050,3.5100],[6.5900,3.5200],[6.5700,3.5150],[6.5500,3.5050]] },
  // Oshodi → Ikeja
  { corridorId: 'c2', name: 'Oshodi → Ikeja',   polyline: [[6.5568,3.3486],[6.5650,3.3490],[6.5800,3.3500],[6.6018,3.3515]] },
  // Ojota → Oshodi
  { corridorId: 'c6', name: 'Ojota → Oshodi',   polyline: [[6.5833,3.3833],[6.5700,3.3700],[6.5600,3.3600],[6.5568,3.3486]] },
];

export const MOCK_BEDROCK_RESPONSES = {
  'Which area of Lagos has the highest unmet demand right now?':
    'Based on current TRAXS network data, the Ikorodu–Owutu corridor has the highest unmet transport demand in Lagos right now. We are tracking approximately 40,000 daily passenger movements on this corridor with a demand score of 94 and a supply score of only 18 — the widest gap in the network. 44 vehicles are active against an estimated requirement of 240+. Recommendation: immediate high-capacity deployment or BRT pilot on this corridor.',
  'What is the load factor on the Lekki corridor today?':
    'The CMS–Lekki corridor is currently operating at a 68% load factor with an average occupancy of 12 passengers per vehicle. Peak load reaches 91% between 17:00 and 20:00. 76 active vehicles are serving this corridor today against an estimated demand requiring 112 vehicles. Supply gap: 36 vehicles. Revenue potential at full capacity: ₦3.1M/month.',
  'Which LGA has the worst transit access?':
    'Ikorodu LGA has the worst transit access score in the current network at 29 out of 100. With a population of 535,000 residents, only 44 active vehicles are tracked serving the area. The Ikorodu–Owutu corridor accounts for 40,000 unserved daily passenger movements. This represents the most severe mobility equity gap in Lagos and the highest-priority target for policy intervention.',
};

export const MOCK_POLICY_RESULTS = {
  'Ban Okada in Zone': {
    movementsDisrupted: 80000,
    wardsAffected: ['Lagos Island Ward A', 'Lagos Island Ward C', 'Epetedo Ward'],
    alternativeCoverage: false,
    recommendation: 'Banning okada in this zone projects a disruption of approximately 80,000 daily passenger movements concentrated in 3 wards with no viable danfo alternative currently available. Recommend phased implementation: deploy 40 additional keke units and establish a BRT feeder service on the Ikorodu–Owutu corridor before enforcement begins.',
  },
  'Close Road Corridor': {
    movementsDisrupted: 32000,
    wardsAffected: ['Surulere Ward B', 'Mushin Ward A'],
    alternativeCoverage: true,
    recommendation: 'Closing this corridor would disrupt approximately 32,000 daily passenger movements. However, 2 viable alternative routes exist via Agege Motor Road and Western Avenue. Impact is manageable with a 3-week advance communication campaign and temporary route subsidies for affected operators.',
  },
  'Add BRT Route': {
    movementsDisrupted: 0,
    wardsAffected: [],
    alternativeCoverage: true,
    recommendation: 'Adding a BRT route on this corridor is projected to absorb 28,000 daily passenger movements currently served by informal transport. Net benefit: reduced congestion by 34%, average commute time reduction of 22 minutes. Estimated capital requirement: ₦2.1B for 30 articulated buses. ROI breakeven: 4.2 years at current demand levels.',
  },
  'Restrict Night Movement': {
    movementsDisrupted: 14000,
    wardsAffected: ['Eti-Osa Ward', 'Victoria Island Ward'],
    alternativeCoverage: false,
    recommendation: 'Night movement restriction would affect approximately 14,000 late-night commuters, primarily shift workers returning from Victoria Island. No formal alternative exists between 22:00 and 05:00. Recommend excluding essential worker corridors from the restriction and establishing a licensed night-bus pilot with 12 vehicles before enforcement.',
  },
};
