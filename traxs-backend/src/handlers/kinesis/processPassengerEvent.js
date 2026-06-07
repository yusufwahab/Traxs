const { runCrowdInference } = require('../../services/crowdInference');

exports.handler = async (event) => {
  const records = event.Records || [];
  console.log(`[Kinesis] Processing ${records.length} passenger event(s)`);

  for (const record of records) {
    try {
      const payload = JSON.parse(Buffer.from(record.kinesis.data, 'base64').toString('utf-8'));
      await runCrowdInference(payload);
    } catch (err) {
      console.error('[Kinesis] Failed to process record:', err.message, record);
    }
  }
};
