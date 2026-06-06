const Driver = require('../models/Driver');
const RouteEvent = require('../models/RouteEvent');
const { rewardDriver } = require('../services/airtimeReward');

const EVENT_TYPES = ['road_blocked', 'police_checkpoint', 'accident', 'flooding', 'long_queue'];

const ussdWebhook = async (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;
  const parts = text ? text.split('*') : [];
  const level = parts.length;

  let response = '';

  try {
    if (text === '' || text === undefined) {
      // Level 1 — Main menu
      response = `CON Welcome to TRAXS
1. Start Trip
2. Report Issue
3. My Earnings Today
4. End Trip`;

    } else if (level === 1) {
      const choice = parts[0];

      if (choice === '1') {
        // Start trip
        const driverId = `DRV-${phoneNumber.replace(/\D/g, '').slice(-6)}`;
        await Driver.findOneAndUpdate(
          { phoneNumber },
          { driverId, phoneNumber, deviceType: 'feature_phone', isActive: true, sessionStart: new Date(), tripsToday: 0 },
          { upsert: true, new: true }
        );
        await rewardDriver(driverId);
        response = `END Trip started! You earned ₦50 airtime.
Drive safe and report issues to help other drivers.`;

      } else if (choice === '2') {
        response = `CON Report an Issue:
1. Road Blocked
2. Police Checkpoint
3. Accident
4. Flooding
5. Long Queue`;

      } else if (choice === '3') {
        const driver = await Driver.findOne({ phoneNumber });
        const earnings = driver ? driver.earningsToday : 0;
        const airtime = driver ? driver.airtimeEarned : 0;
        response = `END Today's Summary:
Trips: ${driver?.tripsToday || 0}
Earnings: ₦${earnings}
Airtime Earned: ₦${airtime}`;

      } else if (choice === '4') {
        const driver = await Driver.findOneAndUpdate(
          { phoneNumber },
          { isActive: false },
          { new: true }
        );
        response = `END Trip ended. Well done!
Trips today: ${driver?.tripsToday || 0}
Earnings: ₦${driver?.earningsToday || 0}
Airtime: ₦${driver?.airtimeEarned || 0}`;

      } else {
        response = 'END Invalid option. Please try again.';
      }

    } else if (level === 2 && parts[0] === '2') {
      const issueIndex = parseInt(parts[1]) - 1;
      if (issueIndex >= 0 && issueIndex < EVENT_TYPES.length) {
        const driver = await Driver.findOne({ phoneNumber });
        if (driver) {
          const [lng, lat] = driver.currentLocation?.coordinates || [3.3792, 6.5244];
          await RouteEvent.create({
            driverId: driver.driverId,
            eventType: EVENT_TYPES[issueIndex],
            location: { type: 'Point', coordinates: [lng, lat] },
            description: `Reported via USSD by ${phoneNumber}`
          });
          await rewardDriver(driver.driverId);
          response = `END Report submitted! You earned ₦50 airtime. Thank you for keeping Lagos moving.`;
        } else {
          response = 'END Driver not found. Please start your trip first.';
        }
      } else {
        response = 'END Invalid option.';
      }
    } else {
      response = 'END Session ended.';
    }
  } catch (err) {
    console.error('USSD error:', err);
    response = 'END Service error. Please try again.';
  }

  res.set('Content-Type', 'text/plain');
  res.send(response);
};

module.exports = { ussdWebhook };
