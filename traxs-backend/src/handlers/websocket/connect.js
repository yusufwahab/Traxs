const WebSocketConnection = require('../../models/WebSocketConnection');

exports.handler = async (event) => {
  const connectionId = event.requestContext?.connectionId;
  if (!connectionId) return { statusCode: 400, body: 'Missing connectionId' };

  await WebSocketConnection.add(connectionId).catch(err =>
    console.error('WS connect store failed:', err.message)
  );

  console.log(`[WS] Connected: ${connectionId}`);
  return { statusCode: 200, body: 'Connected' };
};
