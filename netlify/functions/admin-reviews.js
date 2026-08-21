const { listAllReviews, requireAdmin } = require('../lib/reviews-store');

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  try {
    requireAdmin(event);
    const reviews = (await listAllReviews(event)).sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, reviews }) };
  } catch (error) {
    return { statusCode: error.statusCode || 500, headers, body: JSON.stringify({ error: error.message || 'Could not load reviews' }) };
  }
};
