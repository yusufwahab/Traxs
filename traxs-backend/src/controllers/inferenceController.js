const InferredVehicle = require('../models/InferredVehicle');
const MobilitySnapshot = require('../models/MobilitySnapshot');
const RouteEvent = require('../models/RouteEvent');

const getVehicles = async (req, res) => {
  try {
    const vehicles = await InferredVehicle.find({ status: 'active' });
    res.json({ success: true, data: vehicles });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getCorridors = async (req, res) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const snapshots = await MobilitySnapshot.find({ timestamp: { $gte: since } }).sort({ timestamp: -1 });

    const grouped = snapshots.reduce((acc, s) => {
      if (!acc[s.corridorId]) acc[s.corridorId] = [];
      acc[s.corridorId].push(s);
      return acc;
    }, {});

    res.json({ success: true, data: grouped });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getGhostCorridors = async (req, res) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const ghosts = await MobilitySnapshot.find({ timestamp: { $gte: since }, ghostCorridor: true })
      .sort({ demandScore: -1 })
      .distinct('corridorId');

    const latest = await MobilitySnapshot.aggregate([
      { $match: { corridorId: { $in: ghosts }, ghostCorridor: true } },
      { $sort: { timestamp: -1 } },
      { $group: { _id: '$corridorId', doc: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$doc' } }
    ]);

    res.json({ success: true, data: latest });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getEvents = async (req, res) => {
  try {
    const since = new Date(Date.now() - 6 * 60 * 60 * 1000);
    const events = await RouteEvent.find({ timestamp: { $gte: since }, isActive: true }).sort({ timestamp: -1 });
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getVehicles, getCorridors, getGhostCorridors, getEvents };
