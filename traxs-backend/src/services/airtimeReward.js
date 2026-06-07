const Driver = require('../models/Driver');

const AIRTIME_INCREMENT = 50;

async function rewardDriver(driverId) {
  const driver = await Driver.increment(driverId, 'airtimeEarned', AIRTIME_INCREMENT);
  if (!driver) return;
  console.log(`[Airtime] Rewarded ₦${AIRTIME_INCREMENT} to driver ${driverId}. Total earned: ₦${driver.airtimeEarned}`);
}

module.exports = { rewardDriver };
