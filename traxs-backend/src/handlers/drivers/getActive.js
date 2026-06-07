const { ok, serverError } = require('../../utils/response');
const Driver = require('../../models/Driver');

exports.handler = async () => {
  try {
    const drivers = await Driver.findActive();
    const slim = drivers.map(d => ({
      driverId: d.driverId,
      vehicleType: d.vehicleType,
      currentLocation: d.currentLocation,
      currentRoute: d.currentRoute,
      homepark: d.homepark,
    }));
    return ok(slim);
  } catch (err) {
    return serverError(err);
  }
};
