const { ok } = require('../utils/response');

exports.handler = async () => ok({ status: 'TRAXS backend running on AWS Lambda' });
