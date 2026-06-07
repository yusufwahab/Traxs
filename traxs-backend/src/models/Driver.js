const { PutCommand, GetCommand, UpdateCommand, ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { dynamo } = require('../config/aws');
const { tables } = require('../config/env');

const TABLE = tables.drivers;

const Driver = {
  async put(item) {
    await dynamo.send(new PutCommand({ TableName: TABLE, Item: item }));
    return item;
  },

  async getByDriverId(driverId) {
    const { Item } = await dynamo.send(new GetCommand({ TableName: TABLE, Key: { driverId } }));
    return Item || null;
  },

  async getByPhoneNumber(phoneNumber) {
    const { Items } = await dynamo.send(new QueryCommand({
      TableName: TABLE,
      IndexName: 'phone-index',
      KeyConditionExpression: 'phoneNumber = :p',
      ExpressionAttributeValues: { ':p': phoneNumber },
    }));
    return Items?.[0] || null;
  },

  async update(driverId, fields) {
    const entries = Object.entries(fields);
    const expr = 'SET ' + entries.map((_, i) => `#f${i} = :v${i}`).join(', ');
    const names = Object.fromEntries(entries.map(([k], i) => [`#f${i}`, k]));
    const vals = Object.fromEntries(entries.map(([, v], i) => [`:v${i}`, v]));

    const { Attributes } = await dynamo.send(new UpdateCommand({
      TableName: TABLE,
      Key: { driverId },
      UpdateExpression: expr,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: vals,
      ReturnValues: 'ALL_NEW',
    }));
    return Attributes;
  },

  async increment(driverId, field, amount) {
    const { Attributes } = await dynamo.send(new UpdateCommand({
      TableName: TABLE,
      Key: { driverId },
      UpdateExpression: 'SET #f = if_not_exists(#f, :zero) + :amt',
      ExpressionAttributeNames: { '#f': field },
      ExpressionAttributeValues: { ':amt': amount, ':zero': 0 },
      ReturnValues: 'ALL_NEW',
    }));
    return Attributes;
  },

  async findActive() {
    const { Items } = await dynamo.send(new ScanCommand({
      TableName: TABLE,
      FilterExpression: 'isActive = :t',
      ExpressionAttributeValues: { ':t': true },
    }));
    return Items || [];
  },

  async countActive() {
    const items = await this.findActive();
    return items.length;
  },

  async upsertByPhone(phoneNumber, data) {
    const existing = await this.getByPhoneNumber(phoneNumber);
    const item = { ...(existing || {}), ...data, phoneNumber };
    await this.put(item);
    return item;
  },
};

module.exports = Driver;
