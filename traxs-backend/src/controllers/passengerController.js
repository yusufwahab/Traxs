const PassengerEvent = require('../models/PassengerEvent');
const { runCrowdInference } = require('../services/crowdInference');

let _io;
const setIo = (io) => { _io = io; };

const postEvent = async (req, res) => {
  try {
    const { deviceId, lat, lng, speed, heading, motionType } = req.body;
    const event = await PassengerEvent.create({
      deviceId, speed, heading, motionType,
      location: { type: 'Point', coordinates: [lng, lat] }
    });

    _io?.emit('passenger:event', { deviceId, lat, lng, motionType });
    runCrowdInference(event, _io).catch(err => console.error('Inference error:', err));

    res.json({ success: true, data: { eventId: event._id } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { setIo, postEvent };
