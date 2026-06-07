const { ok, serverError } = require('../../utils/response');
const MobilitySnapshot = require('../../models/MobilitySnapshot');
const InferredVehicle = require('../../models/InferredVehicle');
const RouteEvent = require('../../models/RouteEvent');

exports.handler = async () => {
  try {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const since6h = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

    const [allSnapshots, congestionEvents, vehiclesByRoute] = await Promise.all([
      MobilitySnapshot.findAllSince(since24h),
      RouteEvent.findActiveSince(since6h),
      InferredVehicle.countByRoute(),
    ]);

    const latestPerCorridor = {};
    for (const s of allSnapshots) {
      if (!latestPerCorridor[s.corridorId] || s.timestamp > latestPerCorridor[s.corridorId].timestamp) {
        latestPerCorridor[s.corridorId] = s;
      }
    }

    const ghosts = Object.values(latestPerCorridor).filter(s => s.ghostCorridor);

    const heatmapData = Object.values(latestPerCorridor)
      .sort((a, b) => b.demandScore - a.demandScore)
      .slice(0, 10)
      .map(s => ({
        corridorId: s.corridorId,
        corridorName: s.corridorName,
        demandScore: s.demandScore,
        passengerMovements: s.passengerMovements,
      }));

    return ok({
      ghostCorridors: ghosts,
      congestionHotspots: congestionEvents.map(e => ({ ...e, severity: e.eventType })),
      vehiclesByZone: vehiclesByRoute,
      heatmapData,
    });
  } catch (err) {
    return serverError(err);
  }
};
