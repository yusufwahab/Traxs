const { text, serverError } = require('../../utils/response');
const Driver = require('../../models/Driver');
const RouteEvent = require('../../models/RouteEvent');
const { rewardDriver } = require('../../services/airtimeReward');

const EVENT_TYPES = ['road_blocked', 'police_checkpoint', 'accident', 'flooding', 'long_queue'];

function parseBody(rawBody) {
  const params = new URLSearchParams(rawBody || '');
  return {
    sessionId: params.get('sessionId'),
    serviceCode: params.get('serviceCode'),
    phoneNumber: params.get('phoneNumber'),
    ussdText: params.get('text') || '',
  };
}

exports.handler = async (event) => {
  try {
    const { phoneNumber, ussdText } = parseBody(event.body);
    const parts = ussdText ? ussdText.split('*') : [];
    const level = parts.length;

    let response = '';

    if (!ussdText) {
      response = `CON Welcome to TRAXS
1. Start Trip
2. Report Issue
3. My Earnings Today
4. End Trip`;

    } else if (level === 1) {
      const choice = parts[0];

      if (choice === '1') {
        const driverId = `DRV-${phoneNumber.replace(/\D/g, '').slice(-6)}`;
        await Driver.upsertByPhone(phoneNumber, {
          driverId,
          deviceType: 'feature_phone',
          isActive: true,
          sessionStart: new Date().toISOString(),
          tripsToday: 0,
          earningsToday: 0,
          airtimeEarned: 0,
        });
        await rewardDriver(driverId);
        response = `END Trip started! You earned ₦50 airtime.\nDrive safe and report issues to help other drivers.`;

      } else if (choice === '2') {
        response = `CON Report an Issue:
1. Road Blocked
2. Police Checkpoint
3. Accident
4. Flooding
5. Long Queue`;

      } else if (choice === '3') {
        const driver = await Driver.getByPhoneNumber(phoneNumber);
        response = `END Today's Summary:
Trips: ${driver?.tripsToday || 0}
Earnings: ₦${driver?.earningsToday || 0}
Airtime Earned: ₦${driver?.airtimeEarned || 0}`;

      } else if (choice === '4') {
        const driver = await Driver.getByPhoneNumber(phoneNumber);
        if (driver) await Driver.update(driver.driverId, { isActive: false });
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
        const driver = await Driver.getByPhoneNumber(phoneNumber);
        if (driver) {
          const [lng, lat] = driver.currentLocation?.coordinates || [3.3792, 6.5244];
          await RouteEvent.create({
            driverId: driver.driverId,
            eventType: EVENT_TYPES[issueIndex],
            location: { type: 'Point', coordinates: [lng, lat] },
            description: `Reported via USSD by ${phoneNumber}`,
          });
          await rewardDriver(driver.driverId);
          response = 'END Report submitted! You earned ₦50 airtime. Thank you for keeping Lagos moving.';
        } else {
          response = 'END Driver not found. Please start your trip first.';
        }
      } else {
        response = 'END Invalid option.';
      }
    } else {
      response = 'END Session ended.';
    }

    return text(response);
  } catch (err) {
    console.error('USSD error:', err);
    return text('END Service error. Please try again.');
  }
};
