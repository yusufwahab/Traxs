const { ok, serverError } = require('../../utils/response');
const MobilitySnapshot = require('../../models/MobilitySnapshot');

exports.handler = async () => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const snapshots = await MobilitySnapshot.findAllSince(since);

    const grouped = snapshots.reduce((acc, s) => {
      if (!acc[s.corridorId]) acc[s.corridorId] = [];
      acc[s.corridorId].push(s);
      return acc;
    }, {});

    return ok(grouped);
  } catch (err) {
    return serverError(err);
  }
};
