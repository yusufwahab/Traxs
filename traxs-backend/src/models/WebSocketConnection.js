const { PutCommand, DeleteCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { dynamo } = require('../config/aws');
const { tables } = require('../config/env');

const TABLE = tables.wsConnections;
const TTL_SECONDS = 86400; // 24 hours

const WebSocketConnection = {
  async add(connectionId) {
    await dynamo.send(new PutCommand({
      TableName: TABLE,
      Item: {
        connectionId,
        connectedAt: new Date().toISOString(),
        ttl: Math.floor(Date.now() / 1000) + TTL_SECONDS,
      },
    }));
  },

  async remove(connectionId) {
    await dynamo.send(new DeleteCommand({ TableName: TABLE, Key: { connectionId } }));
  },

  async getAll() {
    const { Items } = await dynamo.send(new ScanCommand({ TableName: TABLE }));
    return (Items || []).map(i => i.connectionId);
  },
};

module.exports = WebSocketConnection;
