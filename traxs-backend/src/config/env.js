require('dotenv').config();

module.exports = {
  region: process.env.AWS_REGION || 'us-east-1',
  stage: process.env.STAGE || 'dev',

  tables: {
    drivers: process.env.DRIVERS_TABLE,
    passengerEvents: process.env.PASSENGER_EVENTS_TABLE,
    routeEvents: process.env.ROUTE_EVENTS_TABLE,
    mobilitySnapshots: process.env.MOBILITY_SNAPSHOTS_TABLE,
    inferredVehicles: process.env.INFERRED_VEHICLES_TABLE,
    wsConnections: process.env.WEBSOCKET_CONNECTIONS_TABLE,
  },

  s3: {
    rawBucket: process.env.S3_RAW_BUCKET,
  },

  sns: {
    routeAlertsTopic: process.env.SNS_ROUTE_ALERTS_TOPIC,
  },

  kinesis: {
    passengerStream: process.env.KINESIS_PASSENGER_STREAM,
  },

  websocket: {
    endpoint: process.env.WEBSOCKET_API_ENDPOINT,
  },

  bedrock: {
    modelId: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0',
  },

  africasTalking: {
    apiKey: process.env.AFRICAS_TALKING_API_KEY,
    username: process.env.AFRICAS_TALKING_USERNAME || 'sandbox',
  },
};
