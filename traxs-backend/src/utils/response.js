const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
  'Content-Type': 'application/json',
};

function ok(data) {
  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ success: true, data }),
  };
}

function created(data) {
  return {
    statusCode: 201,
    headers: CORS_HEADERS,
    body: JSON.stringify({ success: true, data }),
  };
}

function notFound(message = 'Not found') {
  return {
    statusCode: 404,
    headers: CORS_HEADERS,
    body: JSON.stringify({ success: false, error: message }),
  };
}

function serverError(err) {
  console.error('[Lambda Error]', err);
  return {
    statusCode: 500,
    headers: CORS_HEADERS,
    body: JSON.stringify({ success: false, error: err.message || 'Internal server error' }),
  };
}

function text(body, statusCode = 200) {
  return {
    statusCode,
    headers: { 'Content-Type': 'text/plain' },
    body,
  };
}

module.exports = { ok, created, notFound, serverError, text };
