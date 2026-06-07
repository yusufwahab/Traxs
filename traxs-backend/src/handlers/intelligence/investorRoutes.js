const { ok, serverError } = require('../../utils/response');
const MobilitySnapshot = require('../../models/MobilitySnapshot');

exports.handler = async () => {
  try {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const snapshots = await MobilitySnapshot.findLatestPerCorridor(since24h);

    const routes = snapshots.map(s => {
      const gap = s.demandScore - s.supplyScore;
      const viabilityScore = Math.min(100, Math.max(0, gap + s.loadFactor / 2));
      const estimatedRevenuePotential = Math.round((s.passengerMovements * 200 * 0.3) / 1000);
      return {
        corridorId: s.corridorId,
        corridorName: s.corridorName,
        loadFactor: s.loadFactor,
        averageOccupancy: s.averageOccupancy,
        demandScore: s.demandScore,
        supplyScore: s.supplyScore,
        estimatedRevenuePotentialKPerDay: estimatedRevenuePotential,
        viabilityScore: Math.round(viabilityScore),
      };
    });

    return ok(routes.sort((a, b) => b.viabilityScore - a.viabilityScore));
  } catch (err) {
    return serverError(err);
  }
};
