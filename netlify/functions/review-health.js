const { listAllReviews } = require('../lib/reviews-store');

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  try {
    const reviews = await listAllReviews(event);
    const seedCount = reviews.filter(r => String(r.id || '').startsWith('seed-')).length;
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        runtime: 'lambda-connected',
        consistency: 'eventual',
        blobs: true,
        reviewCount: reviews.length,
        seedCount,
        adminSecretConfigured: Boolean(process.env.REVIEW_ADMIN_SECRET)
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        ok: false,
        runtime: 'lambda-connected',
        consistency: 'eventual',
        blobs: false,
        error: error.message || 'Review storage unavailable',
        adminSecretConfigured: Boolean(process.env.REVIEW_ADMIN_SECRET)
      })
    };
  }
};
