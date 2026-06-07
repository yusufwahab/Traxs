const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { ok, notFound, serverError } = require('../../utils/response');
const Driver = require('../../models/Driver');
const { broadcast } = require('../../utils/websocket');
const { s3 } = require('../../config/aws');
const { s3: s3cfg } = require('../../config/env');
const { v4: uuidv4 } = require('uuid');

async function archive(data) {
  if (!s3cfg.rawBucket || s3cfg.rawBucket.startsWith('REPLACE')) return;
  const key = `raw-events/driver-location/${new Date().toISOString().split('T')[0]}/${uuidv4()}.json`;
  await s3.send(new PutObjectCommand({
    Bucket: s3cfg.rawBucket,
    Key: key,
    Body: JSON.stringify(data),
    ContentType: 'application/json',
  })).catch(e => console.error('S3 archive failed:', e.message));
}

exports.handler = async (event) => {
  try {
    const { driverId, lat, lng } = JSON.parse(event.body || '{}');

    await archive({ driverId, lat, lng, timestamp: new Date().toISOString() });

    const driver = await Driver.getByDriverId(driverId);
    if (!driver) return notFound('Driver not found');

    await Driver.update(driverId, {
      currentLocation: { type: 'Point', coordinates: [lng, lat] },
    });

    await broadcast('driver:location_update', { driverId, lat, lng, route: driver.currentRoute || null });

    return ok({ driverId, lat, lng });
  } catch (err) {
    return serverError(err);
  }
};
