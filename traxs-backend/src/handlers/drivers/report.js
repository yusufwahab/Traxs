const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { PublishCommand } = require('@aws-sdk/client-sns');
const { ok, serverError } = require('../../utils/response');
const RouteEvent = require('../../models/RouteEvent');
const { rewardDriver } = require('../../services/airtimeReward');
const { broadcast } = require('../../utils/websocket');
const { s3, sns } = require('../../config/aws');
const { s3: s3cfg, sns: snscfg } = require('../../config/env');
const { v4: uuidv4 } = require('uuid');

async function archive(data) {
  if (!s3cfg.rawBucket || s3cfg.rawBucket.startsWith('REPLACE')) return;
  const key = `raw-events/route-report/${new Date().toISOString().split('T')[0]}/${uuidv4()}.json`;
  await s3.send(new PutObjectCommand({
    Bucket: s3cfg.rawBucket,
    Key: key,
    Body: JSON.stringify(data),
    ContentType: 'application/json',
  })).catch(e => console.error('S3 archive failed:', e.message));
}

async function publishAlert(routeEvent) {
  if (!snscfg.routeAlertsTopic || snscfg.routeAlertsTopic.startsWith('REPLACE')) return;
  await sns.send(new PublishCommand({
    TopicArn: snscfg.routeAlertsTopic,
    Subject: `TRAXS Route Alert: ${routeEvent.eventType}`,
    Message: JSON.stringify({
      type: 'route_alert',
      eventType: routeEvent.eventType,
      location: routeEvent.location,
      description: routeEvent.description,
      timestamp: routeEvent.timestamp,
      driverId: routeEvent.driverId,
    }),
    MessageAttributes: {
      eventType: { DataType: 'String', StringValue: routeEvent.eventType },
    },
  })).catch(e => console.error('SNS publish failed:', e.message));
}

exports.handler = async (event) => {
  try {
    const { driverId, eventType, lat, lng, description } = JSON.parse(event.body || '{}');

    const rawPayload = { driverId, eventType, lat, lng, description, timestamp: new Date().toISOString() };
    await archive(rawPayload);

    const routeEvent = await RouteEvent.create({
      driverId,
      eventType,
      description,
      location: { type: 'Point', coordinates: [lng, lat] },
    });

    await Promise.all([
      rewardDriver(driverId),
      publishAlert(routeEvent),
      broadcast('event:new_report', {
        eventType,
        lat,
        lng,
        description,
        timestamp: routeEvent.timestamp,
      }),
    ]);

    return ok(routeEvent);
  } catch (err) {
    return serverError(err);
  }
};
