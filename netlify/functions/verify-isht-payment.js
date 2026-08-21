const crypto = require('crypto');

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed', flow: 'verify-v6' }) };
  }

  try {
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Razorpay secret is missing in Netlify environment variables', flow: 'verify-v6' }) };
    }

    const body = JSON.parse(event.body || '{}');
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'Missing payment verification fields', flow: 'verify-v6' }) };
    }

    const expected = crypto.createHmac('sha256', key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(String(razorpay_signature), 'utf8');
    const valid = a.length === b.length && crypto.timingSafeEqual(a, b);
    if (!valid) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'Signature mismatch', flow: 'verify-v6' }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, flow: 'verify-v6' }) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: error.message || 'Verification failed', flow: 'verify-v6' }) };
  }
};
