const { ok, serverError } = require('../../utils/response');
const InferredVehicle = require('../../models/InferredVehicle');

exports.handler = async () => {
  try {
    const vehicles = await InferredVehicle.findActive();
    return ok(vehicles);
  } catch (err) {
    return serverError(err);
  }
};
