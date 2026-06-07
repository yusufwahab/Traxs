const { PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { dynamo } = require('../config/aws');
const { tables } = require('../config/env');

const TABLE = tables.mobilitySnapshots;
const SNAPSHOT_PK = 'snapshot';

const MobilitySnapshot = {
  async create(data) {
    const timestamp = new Date().toISOString();
    const item = {
      corridorId: data.corridorId,
      timestamp,
      snapshotPk: SNAPSHOT_PK,
      corridorName: data.corridorName,
      passengerMovements: data.passengerMovements || 0,
      activeVehicles: data.activeVehicles || 0,
      averageOccupancy: data.averageOccupancy || 0,
      loadFactor: data.loadFactor || 0,
      demandScore: data.demandScore || 0,
      supplyScore: data.supplyScore || 0,
      ghostCorridor: data.ghostCorridor || false,
    };
    await dynamo.send(new PutCommand({ TableName: TABLE, Item: item }));
    return item;
  },

  async findByCorridor(corridorId, sinceIso) {
    const params = {
      TableName: TABLE,
      KeyConditionExpression: 'corridorId = :c AND #ts >= :since',
      ExpressionAttributeNames: { '#ts': 'timestamp' },
      ExpressionAttributeValues: { ':c': corridorId, ':since': sinceIso },
      ScanIndexForward: false,
    };
    const { Items } = await dynamo.send(new QueryCommand(params));
    return Items || [];
  },

  async findAllSince(sinceIso) {
    const { Items } = await dynamo.send(new QueryCommand({
      TableName: TABLE,
      IndexName: 'all-time-index',
      KeyConditionExpression: 'snapshotPk = :pk AND #ts >= :since',
      ExpressionAttributeNames: { '#ts': 'timestamp' },
      ExpressionAttributeValues: { ':pk': SNAPSHOT_PK, ':since': sinceIso },
      ScanIndexForward: false,
    }));
    return Items || [];
  },

  async findLatestPerCorridor(sinceIso) {
    const all = await this.findAllSince(sinceIso);
    const latestMap = {};
    for (const s of all) {
      if (!latestMap[s.corridorId] || s.timestamp > latestMap[s.corridorId].timestamp) {
        latestMap[s.corridorId] = s;
      }
    }
    return Object.values(latestMap);
  },

  async findGhostsSince(sinceIso) {
    const all = await this.findAllSince(sinceIso);
    return all.filter(s => s.ghostCorridor === true);
  },
};

module.exports = MobilitySnapshot;
