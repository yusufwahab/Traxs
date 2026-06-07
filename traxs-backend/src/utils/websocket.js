const { PostToConnectionCommand } = require('@aws-sdk/client-apigatewaymanagementapi');
const { getWsClient } = require('../config/aws');
const { websocket } = require('../config/env');
const WebSocketConnection = require('../models/WebSocketConnection');

async function broadcast(event, data) {
  const endpoint = websocket.endpoint;
  if (!endpoint || endpoint.startsWith('REPLACE')) return;

  const client = getWsClient(endpoint);
  const connectionIds = await WebSocketConnection.getAll();
  const payload = Buffer.from(JSON.stringify({ event, data }));

  const sends = connectionIds.map(connectionId =>
    client.send(new PostToConnectionCommand({ ConnectionId: connectionId, Data: payload }))
      .catch(err => {
        if (err.$metadata?.httpStatusCode === 410) {
          return WebSocketConnection.remove(connectionId);
        }
        console.error(`WS send failed for ${connectionId}:`, err.message);
      })
  );

  await Promise.allSettled(sends);
}

module.exports = { broadcast };
