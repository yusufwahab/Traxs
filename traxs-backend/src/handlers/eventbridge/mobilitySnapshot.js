const { takeSnapshot } = require('../../services/mobilitySnapshot');

exports.handler = async () => {
  console.log('[EventBridge] Mobility snapshot triggered');
  await takeSnapshot();
  console.log('[EventBridge] Mobility snapshot complete');
};
