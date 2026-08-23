async function createRazorpayOrder(keyId, keySecret, orderPayload) {
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderPayload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = data?.error?.description || data?.error?.reason || data?.error || 'Razorpay rejected the Dakshina order';
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  return data;
}

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed', flow: 'dakshina-v6' }) };
  }

  try {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Razorpay keys are missing in Netlify environment variables', flow: 'dakshina-v6' }) };
    }

    const body = JSON.parse(event.body || '{}');
    const amountRupees = Number(body.amount);
    if (!Number.isInteger(amountRupees) || amountRupees < 121 || amountRupees > 500000) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Dakshina must be a whole rupee amount of ₹121 or more.', flow: 'dakshina-v6' }) };
    }

    const clean = (value, max = 250) => String(value || '').trim().slice(0, max);
    const rating = Number(body.rating);
    const ratingText = Number.isInteger(rating) && rating >= 1 && rating <= 5 ? `${rating}/5` : 'Not provided';
    const feedback = clean(body.feedback, 250);
    const name = clean(body.name, 100);
    const phone = clean(body.phone, 30);
    const amountPaise = amountRupees * 100;

    const order = await createRazorpayOrder(key_id, key_secret, {
      amount: amountPaise,
      currency: 'INR',
      receipt: `dak_${Date.now()}`.slice(0, 40),
      notes: {
        payment_type: 'Isht Devta Dakshina',
        funnel_version: 'dakshina-v6',
        dakshina_amount: String(amountRupees),
        customer_name: name,
        whatsapp_number: phone,
        rating: ratingText,
        feedback_preview: feedback,
        source: 'Dakshina feedback page'
      }
    });

    if (Number(order.amount) !== amountPaise) {
      throw new Error('Safety check failed: Dakshina amount mismatch');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ flow: 'dakshina-v6', order_id: order.id, amount: amountPaise, currency: 'INR', key_id })
    };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message || 'Could not create Dakshina order', flow: 'dakshina-v6' }) };
  }
};
