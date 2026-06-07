const { ok, serverError } = require('../../utils/response');
const MobilitySnapshot = require('../../models/MobilitySnapshot');

exports.handler = async () => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const ghosts = await MobilitySnapshot.findGhostsSince(since);

    const latestPerCorridor = {};
    for (const s of ghosts) {
      if (!latestPerCorridor[s.corridorId] || s.timestamp > latestPerCorridor[s.corridorId].timestamp) {
        latestPerCorridor[s.corridorId] = s;
      }
    }

    return ok(Object.values(latestPerCorridor));
  } catch (err) {
    return serverError(err);
  }
};
