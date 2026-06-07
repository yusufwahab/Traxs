exports.handler = async (event) => {
  const connectionId = event.requestContext?.connectionId;
  console.log(`[WS] Default message from: ${connectionId}`);
  return { statusCode: 200, body: 'OK' };
};
