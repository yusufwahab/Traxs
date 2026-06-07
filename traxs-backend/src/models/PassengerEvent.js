const { PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { dynamo } = require('../config/aws');
const { tables } = require('../config/env');
const { v4: uuidv4 } = require('uuid');

const TABLE = tables.passengerEvents;
const PARTITION = 'passenger_event';

const PassengerEvent = {
  async create(data) {
    const eventId = uuidv4();
    const timestamp = new Date().toISOString();
    const item = {
      pk: PARTITION,
      sk: `${timestamp}#${eventId}`,
      eventId,
      timestamp,
      deviceId: data.deviceId,
      location: data.location,
      speed: data.speed || 0,
      heading: data.heading || 0,
      motionType: data.motionType || 'walking',
    };
    await dynamo.send(new PutCommand({ TableName: TABLE, Item: item }));
    return item;
  },

  async findSince(sinceIso) {
    const { Items } = await dynamo.send(new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: 'pk = :pk AND sk >= :since',
      ExpressionAttributeValues: {
        ':pk': PARTITION,
        ':since': sinceIso,
      },
    }));
    return Items || [];
  },

  async countSince(sinceIso) {
    const items = await this.findSince(sinceIso);
    return items.length;
  },
};

module.exports = PassengerEvent;
