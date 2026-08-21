const { createReview } = require('../lib/reviews-store');

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  try {
    const body = JSON.parse(event.body || '{}');
    const review = await createReview(event, body);
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        ok: true,
        id: review.id,
        publicConsent: review.publicConsent,
        status: review.status,
        message: review.publicConsent ? 'Feedback saved and sent for manual approval.' : 'Feedback saved privately.'
      })
    };
  } catch (error) {
    return { statusCode: error.statusCode || 500, headers, body: JSON.stringify({ error: error.message || 'Could not save review' }) };
  }
};
