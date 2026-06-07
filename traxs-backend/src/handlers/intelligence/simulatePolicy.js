const { ok, serverError } = require('../../utils/response');
const MobilitySnapshot = require('../../models/MobilitySnapshot');

exports.handler = async (event) => {
  try {
    const { type, zone } = JSON.parse(event.body || '{}');
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const snapshots = await MobilitySnapshot.findAllSince(since24h);

    const totalMovements = snapshots.reduce((s, n) => s + n.passengerMovements, 0);
    const affectedMovements = Math.round(totalMovements * 0.2);

    const simulation = {
      policy: { type, zone },
      estimatedPassengersDisrupted: affectedMovements,
      affectedWards: [zone, `${zone} North`, `${zone} South`],
      alternativeCoverageAvailable: type === 'ban_okada'
        ? 'Limited — danfo coverage partial'
        : 'Moderate — rerouting possible',
      riskLevel: affectedMovements > 10000 ? 'High' : 'Medium',
      recommendation: `Consider phased implementation in ${zone} with alternative transport augmentation.`,
    };

    return ok(simulation);
  } catch (err) {
    return serverError(err);
  }
};
