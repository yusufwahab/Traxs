const { InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { ok, serverError } = require('../../utils/response');
const MobilitySnapshot = require('../../models/MobilitySnapshot');
const InferredVehicle = require('../../models/InferredVehicle');
const RouteEvent = require('../../models/RouteEvent');
const Driver = require('../../models/Driver');
const { bedrock } = require('../../config/aws');
const { bedrock: bedrockCfg } = require('../../config/env');

async function buildMobilityContext() {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const since6h = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

  const [snapshots, activeVehicles, activeAlerts, activeDrivers] = await Promise.all([
    MobilitySnapshot.findLatestPerCorridor(since24h),
    InferredVehicle.findActive(),
    RouteEvent.findActiveSince(since6h),
    Driver.countActive(),
  ]);

  const corridorSummary = snapshots.map(s =>
    `- ${s.corridorName}: demand=${s.demandScore}/100, supply=${s.supplyScore}/100, load=${s.loadFactor}%, ghost=${s.ghostCorridor}`
  ).join('\n');

  const alertSummary = activeAlerts.length
    ? activeAlerts.map(e => `- ${e.eventType} at [${e.location?.coordinates}] by driver ${e.driverId}`).join('\n')
    : '- None currently active';

  return `
TRAXS Lagos Mobility Intelligence — Current Snapshot (${new Date().toISOString()})

Active Drivers: ${activeDrivers}
Active Inferred Vehicles: ${activeVehicles.length}
Ghost Corridors (high demand, low supply): ${snapshots.filter(s => s.ghostCorridor).map(s => s.corridorName).join(', ') || 'None'}

Corridor Status:
${corridorSummary}

Active Route Alerts (last 6 hours):
${alertSummary}
`.trim();
}

exports.handler = async (event) => {
  try {
    const { question } = JSON.parse(event.body || '{}');
    if (!question) return ok({ answer: 'Please provide a question.' });

    const mobilityContext = await buildMobilityContext();

    const prompt = `You are TRAXS, an AI mobility intelligence assistant for Lagos informal transport networks. You have access to real-time data about danfo buses, kekes, okadas, passenger flows, and road conditions.

Here is the current mobility context:
${mobilityContext}

User Question: ${question}

Provide a concise, data-grounded answer. Reference specific corridors, numbers, or alerts when relevant. If you detect a ghost corridor or alert, proactively mention it. Keep your response under 200 words.`;

    const requestBody = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    };

    const command = new InvokeModelCommand({
      modelId: bedrockCfg.modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(requestBody),
    });

    const response = await bedrock.send(command);
    const responseBody = JSON.parse(Buffer.from(response.body).toString('utf-8'));
    const answer = responseBody.content?.[0]?.text || 'Unable to generate a response at this time.';

    return ok({ answer, mobilityContext });
  } catch (err) {
    return serverError(err);
  }
};
