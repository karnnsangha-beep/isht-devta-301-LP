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
    const msg = data?.error?.description || data?.error?.reason || data?.error || 'Razorpay rejected the Navagrah order';
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  return data;
}

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed', flow: 'navagrah99-v6' }) };
  }

  try {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Razorpay keys are missing in Netlify environment variables', flow: 'navagrah99-v6' }) };
    }

    const body = JSON.parse(event.body || '{}');
    const clean = (value, max = 120) => String(value || '').trim().slice(0, max);
    const name = clean(body.name, 100);
    const phone = clean(body.phone, 30);
    if (!name || !phone) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Name and WhatsApp number are required.', flow: 'navagrah99-v6' }) };
    }

    const amountRupees = 99;
    const amountPaise = 9900;
    const order = await createRazorpayOrder(key_id, key_secret, {
      amount: amountPaise,
      currency: 'INR',
      receipt: `nav99_${Date.now()}`.slice(0, 40),
      notes: {
        payment_type: 'Navagrah Remedies',
        funnel_version: 'navagrah99-v6',
        product_price: '99',
        regular_price: '299',
        customer_name: name,
        whatsapp_number: phone,
        source: 'Post-Dakshina customer offer'
      }
    });

    if (Number(order.amount) !== amountPaise) {
      throw new Error('Safety check failed: Navagrah order amount was not ₹99');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ flow: 'navagrah99-v6', order_id: order.id, amount: amountPaise, currency: 'INR', key_id })
    };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message || 'Could not create Navagrah Remedies order', flow: 'navagrah99-v6' }) };
  }
};
