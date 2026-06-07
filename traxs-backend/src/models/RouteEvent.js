const { PutCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { dynamo } = require('../config/aws');
const { tables } = require('../config/env');
const { v4: uuidv4 } = require('uuid');

const TABLE = tables.routeEvents;

const RouteEvent = {
  async create(data) {
    const timestamp = new Date().toISOString();
    const item = {
      eventId: uuidv4(),
      driverId: data.driverId,
      eventType: data.eventType,
      location: data.location,
      description: data.description || '',
      timestamp,
      isActive: true,
      isActiveStr: 'true',
    };
    await dynamo.send(new PutCommand({ TableName: TABLE, Item: item }));
    return item;
  },

  async findActiveSince(sinceIso) {
    const { Items } = await dynamo.send(new QueryCommand({
      TableName: TABLE,
      IndexName: 'active-time-index',
      KeyConditionExpression: 'isActiveStr = :a AND #ts >= :since',
      ExpressionAttributeNames: { '#ts': 'timestamp' },
      ExpressionAttributeValues: {
        ':a': 'true',
        ':since': sinceIso,
      },
      ScanIndexForward: false,
    }));
    return Items || [];
  },

  async findAll() {
    const { Items } = await dynamo.send(new ScanCommand({ TableName: TABLE }));
    return Items || [];
  },
};

module.exports = RouteEvent;
