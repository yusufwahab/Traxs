const { v4: uuidv4 } = require('uuid');
const Driver = require('../models/Driver');
const RouteEvent = require('../models/RouteEvent');
const { rewardDriver } = require('../services/airtimeReward');

let _io;
const setIo = (io) => { _io = io; };

const activate = async (req, res) => {
  try {
    const { phoneNumber, deviceType, vehicleType, homePark } = req.body;
    const driverId = `DRV-${phoneNumber.replace(/\D/g, '').slice(-6)}-${Date.now().toString(36).toUpperCase()}`;

    const driver = await Driver.findOneAndUpdate(
      { phoneNumber },
      { driverId, phoneNumber, deviceType, vehicleType, homepark: homePark, isActive: true, sessionStart: new Date(), tripsToday: 0, earningsToday: 0 },
      { upsert: true, new: true }
    );

    await rewardDriver(driver.driverId);
    res.json({ success: true, data: { driverId: driver.driverId } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const updateLocation = async (req, res) => {
  try {
    const { driverId, lat, lng, speed, heading } = req.body;
    const driver = await Driver.findOneAndUpdate(
      { driverId },
      { currentLocation: { type: 'Point', coordinates: [lng, lat] } },
      { new: true }
    );
    if (!driver) return res.status(404).json({ success: false, error: 'Driver not found' });

    _io?.emit('driver:location_update', { driverId, lat, lng, route: driver.currentRoute });
    res.json({ success: true, data: { driverId, lat, lng } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const report = async (req, res) => {
  try {
    const { driverId, eventType, lat, lng, description } = req.body;
    const routeEvent = await RouteEvent.create({
      driverId, eventType, description,
      location: { type: 'Point', coordinates: [lng, lat] }
    });

    await rewardDriver(driverId);
    _io?.emit('event:new_report', { eventType, lat, lng, description, timestamp: routeEvent.timestamp });
    res.json({ success: true, data: routeEvent });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const endSession = async (req, res) => {
  try {
    const { driverId } = req.body;
    const driver = await Driver.findOneAndUpdate(
      { driverId },
      { isActive: false },
      { new: true }
    );
    if (!driver) return res.status(404).json({ success: false, error: 'Driver not found' });

    res.json({ success: true, data: { tripsToday: driver.tripsToday, earningsToday: driver.earningsToday, airtimeEarned: driver.airtimeEarned } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getActive = async (req, res) => {
  try {
    const drivers = await Driver.find({ isActive: true }).select('driverId vehicleType currentLocation currentRoute homepark');
    res.json({ success: true, data: drivers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { setIo, activate, updateLocation, report, endSession, getActive };
