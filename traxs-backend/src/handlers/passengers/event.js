const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { PutRecordCommand } = require('@aws-sdk/client-kinesis');
const { ok, serverError } = require('../../utils/response');
const PassengerEvent = require('../../models/PassengerEvent');
const { broadcast } = require('../../utils/websocket');
const { s3, kinesis } = require('../../config/aws');
const { s3: s3cfg, kinesis: kinesisCfg } = require('../../config/env');
const { v4: uuidv4 } = require('uuid');

async function archive(data) {
  if (!s3cfg.rawBucket || s3cfg.rawBucket.startsWith('REPLACE')) return;
  const key = `raw-events/passenger-event/${new Date().toISOString().split('T')[0]}/${uuidv4()}.json`;
  await s3.send(new PutObjectCommand({
    Bucket: s3cfg.rawBucket,
    Key: key,
    Body: JSON.stringify(data),
    ContentType: 'application/json',
  })).catch(e => console.error('S3 archive failed:', e.message));
}

async function publishToKinesis(eventItem) {
  if (!kinesisCfg.passengerStream || kinesisCfg.passengerStream.startsWith('REPLACE')) return;
  await kinesis.send(new PutRecordCommand({
    StreamName: kinesisCfg.passengerStream,
    PartitionKey: eventItem.deviceId,
    Data: Buffer.from(JSON.stringify(eventItem)),
  })).catch(e => console.error('Kinesis publish failed:', e.message));
}

exports.handler = async (event) => {
  try {
    const { deviceId, lat, lng, speed, heading, motionType } = JSON.parse(event.body || '{}');

    const rawPayload = { deviceId, lat, lng, speed, heading, motionType, timestamp: new Date().toISOString() };
    await archive(rawPayload);

    const eventItem = await PassengerEvent.create({
      deviceId,
      speed,
      heading,
      motionType,
      location: { type: 'Point', coordinates: [lng, lat] },
    });

    await Promise.all([
      publishToKinesis(eventItem),
      broadcast('passenger:event', { deviceId, lat, lng, motionType }),
    ]);

    return ok({ eventId: eventItem.eventId });
  } catch (err) {
    return serverError(err);
  }
};
