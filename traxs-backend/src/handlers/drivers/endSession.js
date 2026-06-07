const { ok, notFound, serverError } = require('../../utils/response');
const Driver = require('../../models/Driver');

exports.handler = async (event) => {
  try {
    const { driverId } = JSON.parse(event.body || '{}');

    const driver = await Driver.getByDriverId(driverId);
    if (!driver) return notFound('Driver not found');

    await Driver.update(driverId, { isActive: false });

    return ok({
      tripsToday: driver.tripsToday || 0,
      earningsToday: driver.earningsToday || 0,
      airtimeEarned: driver.airtimeEarned || 0,
    });
  } catch (err) {
    return serverError(err);
  }
};
