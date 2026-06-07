const { ok, serverError } = require('../../utils/response');
const MobilitySnapshot = require('../../models/MobilitySnapshot');
const InferredVehicle = require('../../models/InferredVehicle');
const Driver = require('../../models/Driver');

const LGAS = ['Lagos Island', 'Ikeja', 'Surulere', 'Lekki', 'Ikorodu', 'Oshodi-Isolo'];

exports.handler = async () => {
  try {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [snapshots, activeDrivers, activeVehicles] = await Promise.all([
      MobilitySnapshot.findAllSince(since24h),
      Driver.countActive(),
      InferredVehicle.countActive(),
    ]);

    const avgDemand = snapshots.reduce((s, n) => s + n.demandScore, 0) / (snapshots.length || 1);
    const avgSupply = snapshots.reduce((s, n) => s + n.supplyScore, 0) / (snapshots.length || 1);
    const mobilityHealthScore = Math.round((avgSupply / (avgDemand || 1)) * 100);

    const lgaBreakdown = LGAS.map(lga => ({
      lga,
      activeVehicles: Math.floor(activeVehicles / LGAS.length),
      transitScore: Math.floor(Math.random() * 40 + 40),
    }));

    const equityIndex = lgaBreakdown
      .filter(l => l.transitScore < 50)
      .map(l => ({ ...l, flag: 'poor_transit_access' }));

    return ok({ mobilityHealthScore, activeDrivers, activeVehicles, lgaBreakdown, equityIndex });
  } catch (err) {
    return serverError(err);
  }
};
