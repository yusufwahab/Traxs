const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { ok, serverError } = require('../../utils/response');
const Driver = require('../../models/Driver');
const { rewardDriver } = require('../../services/airtimeReward');
const { s3 } = require('../../config/aws');
const { s3: s3cfg } = require('../../config/env');
const { v4: uuidv4 } = require('uuid');

async function archive(data) {
  if (!s3cfg.rawBucket || s3cfg.rawBucket.startsWith('REPLACE')) return;
  const key = `raw-events/driver-activate/${new Date().toISOString().split('T')[0]}/${uuidv4()}.json`;
  await s3.send(new PutObjectCommand({
    Bucket: s3cfg.rawBucket,
    Key: key,
    Body: JSON.stringify(data),
    ContentType: 'application/json',
  })).catch(e => console.error('S3 archive failed:', e.message));
}

exports.handler = async (event) => {
  try {
    const { phoneNumber, deviceType, vehicleType, homePark } = JSON.parse(event.body || '{}');
    const driverId = `DRV-${phoneNumber.replace(/\D/g, '').slice(-6)}-${Date.now().toString(36).toUpperCase()}`;

    await archive({ phoneNumber, deviceType, vehicleType, homePark, driverId });

    const item = {
      driverId,
      phoneNumber,
      deviceType: deviceType || 'smartphone',
      vehicleType: vehicleType || 'danfo',
      homepark: homePark || '',
      isActive: true,
      sessionStart: new Date().toISOString(),
      tripsToday: 0,
      earningsToday: 0,
      airtimeEarned: 0,
    };

    const existing = await Driver.getByPhoneNumber(phoneNumber);
    if (existing) {
      await Driver.update(existing.driverId, { isActive: true, sessionStart: item.sessionStart, tripsToday: 0, earningsToday: 0 });
      await rewardDriver(existing.driverId);
      return ok({ driverId: existing.driverId });
    }

    await Driver.put(item);
    await rewardDriver(driverId);
    return ok({ driverId });
  } catch (err) {
    return serverError(err);
  }
};
