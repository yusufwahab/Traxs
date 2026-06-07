const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { S3Client } = require('@aws-sdk/client-s3');
const { SNSClient } = require('@aws-sdk/client-sns');
const { KinesisClient } = require('@aws-sdk/client-kinesis');
const { BedrockRuntimeClient } = require('@aws-sdk/client-bedrock-runtime');
const { ApiGatewayManagementApiClient } = require('@aws-sdk/client-apigatewaymanagementapi');
const env = require('./env');

const clientConfig = { region: env.region };

const dynamoBase = new DynamoDBClient(clientConfig);
const dynamo = DynamoDBDocumentClient.from(dynamoBase, {
  marshallOptions: { removeUndefinedValues: true },
});

const s3 = new S3Client(clientConfig);
const sns = new SNSClient(clientConfig);
const kinesis = new KinesisClient(clientConfig);
const bedrock = new BedrockRuntimeClient(clientConfig);

function getWsClient(endpoint) {
  return new ApiGatewayManagementApiClient({
    region: env.region,
    endpoint,
  });
}

module.exports = { dynamo, s3, sns, kinesis, bedrock, getWsClient };
