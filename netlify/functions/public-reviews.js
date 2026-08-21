const { listAllReviews, publicReviewShape } = require('../lib/reviews-store');

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=30, s-maxage=30, stale-while-revalidate=120'
  };
  if (event.httpMethod !== 'GET') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  try {
    const all = await listAllReviews();
    const approved = all
      .filter(r => r && r.publicConsent === true && r.status === 'approved' && r.feedback)
      .sort((a, b) => {
        if (Boolean(a.featured) !== Boolean(b.featured)) return a.featured ? -1 : 1;
        const ao = Number(a.sortOrder || Number.MAX_SAFE_INTEGER);
        const bo = Number(b.sortOrder || Number.MAX_SAFE_INTEGER);
        if (ao !== bo) return ao - bo;
        return String(a.approvedAt || a.createdAt || '').localeCompare(String(b.approvedAt || b.createdAt || ''));
      })
      .map(publicReviewShape);
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, reviews: approved }) };
  } catch (error) {
    return { statusCode: 500, headers: { ...headers, 'Cache-Control': 'no-store' }, body: JSON.stringify({ error: error.message || 'Could not load reviews' }) };
  }
};
