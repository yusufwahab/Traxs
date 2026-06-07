const WebSocketConnection = require('../../models/WebSocketConnection');

exports.handler = async (event) => {
  const connectionId = event.requestContext?.connectionId;
  if (!connectionId) return { statusCode: 400, body: 'Missing connectionId' };

  await WebSocketConnection.remove(connectionId).catch(err =>
    console.error('WS disconnect cleanup failed:', err.message)
  );

  console.log(`[WS] Disconnected: ${connectionId}`);
  return { statusCode: 200, body: 'Disconnected' };
};
