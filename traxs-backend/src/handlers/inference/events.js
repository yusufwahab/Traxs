const { ok, serverError } = require('../../utils/response');
const RouteEvent = require('../../models/RouteEvent');

exports.handler = async () => {
  try {
    const since = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const events = await RouteEvent.findActiveSince(since);
    return ok(events);
  } catch (err) {
    return serverError(err);
  }
};
