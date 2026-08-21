const { getReview, saveReview, clean, requireAdmin } = require('../lib/reviews-store');

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  try {
    requireAdmin(event);
    const body = JSON.parse(event.body || '{}');
    const id = clean(body.id, 160);
    const action = clean(body.action, 40);
    if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Review ID is required.' }) };
    const review = await getReview(id);
    if (!review) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Review not found.' }) };

    const now = new Date().toISOString();
    if (action === 'approve') {
      if (!review.publicConsent) return { statusCode: 400, headers, body: JSON.stringify({ error: 'This customer did not give public display permission.' }) };
      review.status = 'approved';
      review.approvedAt = review.approvedAt || now;
      review.verifiedCustomer = body.verifiedCustomer !== false;
    } else if (action === 'reject') {
      review.status = 'rejected';
      review.featured = false;
    } else if (action === 'unpublish') {
      review.status = review.publicConsent ? 'pending' : 'private';
      review.featured = false;
    } else if (action === 'feature') {
      if (review.status !== 'approved' || !review.publicConsent) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Approve the review before featuring it.' }) };
      review.featured = true;
    } else if (action === 'unfeature') {
      review.featured = false;
    } else if (action === 'verify') {
      review.verifiedCustomer = body.verifiedCustomer === true;
    } else if (action === 'reply') {
      review.reply = clean(body.reply, 1200);
    } else if (action === 'clear-reply') {
      review.reply = '';
    } else {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown moderation action.' }) };
    }

    review.updatedAt = now;
    await saveReview(review);
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, review }) };
  } catch (error) {
    return { statusCode: error.statusCode || 500, headers, body: JSON.stringify({ error: error.message || 'Could not update review' }) };
  }
};
