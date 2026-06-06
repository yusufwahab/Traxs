const Driver = require('../models/Driver');

const AIRTIME_INCREMENT = 50;

async function rewardDriver(driverId) {
  const driver = await Driver.findOneAndUpdate(
    { driverId },
    { $inc: { airtimeEarned: AIRTIME_INCREMENT } },
    { new: true }
  );

  if (!driver) return;

  // Production: call Africa's Talking airtime API here
  console.log(`[Airtime] Rewarded ₦${AIRTIME_INCREMENT} to driver ${driverId}. Total earned: ₦${driver.airtimeEarned}`);
}

module.exports = { rewardDriver };
