const { PutCommand, GetCommand, UpdateCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { dynamo } = require('../config/aws');
const { tables } = require('../config/env');

const TABLE = tables.inferredVehicles;

const InferredVehicle = {
  async create(data) {
    const lastUpdated = new Date().toISOString();
    const item = {
      vehicleId: data.vehicleId,
      linkedDriverId: data.linkedDriverId || null,
      estimatedOccupancy: data.estimatedOccupancy || 0,
      currentLocation: data.currentLocation,
      assignedRoute: data.assignedRoute,
      status: data.status || 'active',
      passengerDeviceIds: data.passengerDeviceIds || [],
      lastUpdated,
    };
    await dynamo.send(new PutCommand({ TableName: TABLE, Item: item }));
    return item;
  },

  async getById(vehicleId) {
    const { Item } = await dynamo.send(new GetCommand({ TableName: TABLE, Key: { vehicleId } }));
    return Item || null;
  },

  async update(vehicleId, fields) {
    const entries = Object.entries(fields);
    const expr = 'SET ' + entries.map((_, i) => `#f${i} = :v${i}`).join(', ');
    const names = Object.fromEntries(entries.map(([k], i) => [`#f${i}`, k]));
    const vals = Object.fromEntries(entries.map(([, v], i) => [`:v${i}`, v]));

    const { Attributes } = await dynamo.send(new UpdateCommand({
      TableName: TABLE,
      Key: { vehicleId },
      UpdateExpression: expr,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: vals,
      ReturnValues: 'ALL_NEW',
    }));
    return Attributes;
  },

  async findActive() {
    const { Items } = await dynamo.send(new QueryCommand({
      TableName: TABLE,
      IndexName: 'status-index',
      KeyConditionExpression: '#s = :active',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':active': 'active' },
      ScanIndexForward: false,
    }));
    return Items || [];
  },

  async findActiveOnRoute(assignedRoute, sinceIso) {
    const { Items } = await dynamo.send(new QueryCommand({
      TableName: TABLE,
      IndexName: 'route-index',
      KeyConditionExpression: 'assignedRoute = :r AND lastUpdated >= :since',
      FilterExpression: '#s = :active',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: {
        ':r': assignedRoute,
        ':since': sinceIso,
        ':active': 'active',
      },
      ScanIndexForward: false,
    }));
    return Items || [];
  },

  async countActive() {
    const items = await this.findActive();
    return items.length;
  },

  async findByRoute(assignedRoute) {
    const { Items } = await dynamo.send(new QueryCommand({
      TableName: TABLE,
      IndexName: 'route-index',
      KeyConditionExpression: 'assignedRoute = :r',
      ExpressionAttributeValues: { ':r': assignedRoute },
    }));
    return Items || [];
  },

  async countByRoute() {
    const { Items } = await dynamo.send(new ScanCommand({ TableName: TABLE }));
    const map = {};
    for (const item of (Items || [])) {
      if (item.status === 'active') {
        map[item.assignedRoute] = (map[item.assignedRoute] || 0) + 1;
      }
    }
    return Object.entries(map).map(([_id, count]) => ({ _id, count }));
  },
};

module.exports = InferredVehicle;
