const MobilitySnapshot = require('../models/MobilitySnapshot');
const InferredVehicle = require('../models/InferredVehicle');
const Driver = require('../models/Driver');
const RouteEvent = require('../models/RouteEvent');

const LGAS = ['Lagos Island', 'Ikeja', 'Surulere', 'Lekki', 'Ikorodu', 'Oshodi-Isolo'];

const plannerOverview = async (req, res) => {
  try {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [ghosts, snapshots, activeVehicles, congestionEvents] = await Promise.all([
      MobilitySnapshot.aggregate([
        { $match: { timestamp: { $gte: since24h }, ghostCorridor: true } },
        { $sort: { timestamp: -1 } },
        { $group: { _id: '$corridorId', doc: { $first: '$$ROOT' } } },
        { $replaceRoot: { newRoot: '$doc' } }
      ]),
      MobilitySnapshot.find({ timestamp: { $gte: since24h } }).sort({ demandScore: -1 }).limit(10),
      InferredVehicle.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: '$assignedRoute', count: { $sum: 1 } } }
      ]),
      RouteEvent.find({ timestamp: { $gte: new Date(Date.now() - 6 * 60 * 60 * 1000) }, isActive: true })
    ]);

    const heatmapData = snapshots.map(s => ({
      corridorId: s.corridorId,
      corridorName: s.corridorName,
      demandScore: s.demandScore,
      passengerMovements: s.passengerMovements
    }));

    res.json({
      success: true,
      data: {
        ghostCorridors: ghosts,
        congestionHotspots: congestionEvents.map(e => ({ ...e.toObject(), severity: e.eventType })),
        vehiclesByZone: activeVehicles,
        heatmapData
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const investorRoutes = async (req, res) => {
  try {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const snapshots = await MobilitySnapshot.aggregate([
      { $match: { timestamp: { $gte: since24h } } },
      { $sort: { timestamp: -1 } },
      { $group: { _id: '$corridorId', doc: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$doc' } }
    ]);

    const routes = snapshots.map(s => {
      const gap = s.demandScore - s.supplyScore;
      const viabilityScore = Math.min(100, Math.max(0, gap + s.loadFactor / 2));
      const estimatedRevenuePotential = Math.round((s.passengerMovements * 200 * 0.3) / 1000); // ₦k/day estimate
      return {
        corridorId: s.corridorId,
        corridorName: s.corridorName,
        loadFactor: s.loadFactor,
        averageOccupancy: s.averageOccupancy,
        demandScore: s.demandScore,
        supplyScore: s.supplyScore,
        estimatedRevenuePotentialKPerDay: estimatedRevenuePotential,
        viabilityScore: Math.round(viabilityScore)
      };
    });

    res.json({ success: true, data: routes.sort((a, b) => b.viabilityScore - a.viabilityScore) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const cityHealth = async (req, res) => {
  try {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [snapshots, activeDrivers, activeVehicles] = await Promise.all([
      MobilitySnapshot.find({ timestamp: { $gte: since24h } }),
      Driver.countDocuments({ isActive: true }),
      InferredVehicle.countDocuments({ status: 'active' })
    ]);

    const avgDemand = snapshots.reduce((s, n) => s + n.demandScore, 0) / (snapshots.length || 1);
    const avgSupply = snapshots.reduce((s, n) => s + n.supplyScore, 0) / (snapshots.length || 1);
    const mobilityHealthScore = Math.round((avgSupply / (avgDemand || 1)) * 100);

    const lgaBreakdown = LGAS.map(lga => ({
      lga,
      activeVehicles: Math.floor(activeVehicles / LGAS.length),
      transitScore: Math.floor(Math.random() * 40 + 40)
    }));

    const equityIndex = lgaBreakdown
      .filter(l => l.transitScore < 50)
      .map(l => ({ ...l, flag: 'poor_transit_access' }));

    res.json({
      success: true,
      data: { mobilityHealthScore, activeDrivers, activeVehicles, lgaBreakdown, equityIndex }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const simulatePolicy = async (req, res) => {
  try {
    const { type, zone } = req.body;
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const snapshots = await MobilitySnapshot.find({ timestamp: { $gte: since24h } });

    const totalMovements = snapshots.reduce((s, n) => s + n.passengerMovements, 0);
    const affectedMovements = Math.round(totalMovements * 0.2);

    const simulation = {
      policy: { type, zone },
      estimatedPassengersDisrupted: affectedMovements,
      affectedWards: [zone, `${zone} North`, `${zone} South`],
      alternativeCoverageAvailable: type === 'ban_okada' ? 'Limited — danfo coverage partial' : 'Moderate — rerouting possible',
      riskLevel: affectedMovements > 10000 ? 'High' : 'Medium',
      recommendation: `Consider phased implementation in ${zone} with alternative transport augmentation.`
    };

    res.json({ success: true, data: simulation });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { plannerOverview, investorRoutes, cityHealth, simulatePolicy };
