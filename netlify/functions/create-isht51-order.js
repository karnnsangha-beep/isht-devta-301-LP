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
    const msg = data?.error?.description || data?.error?.reason || data?.error || 'Razorpay rejected the order request';
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  return data;
}

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed', flow: 'isht51-v6' }) };
  }

  try {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Razorpay keys are missing in Netlify environment variables', flow: 'isht51-v6' }) };
    }

    const body = JSON.parse(event.body || '{}');
    const clean = (value, max = 250) => String(value || '').trim().slice(0, max);
    const amountRupees = 51;
    const amountPaise = 5100;

    const order = await createRazorpayOrder(key_id, key_secret, {
      amount: amountPaise,
      currency: 'INR',
      receipt: `isht51_${Date.now()}`.slice(0, 40),
      notes: {
        payment_type: '₹51 Booking Shagun',
        funnel_version: 'isht51-v6',
        base_amount: String(amountRupees),
        amount: String(amountRupees),
        customer_name: clean(body.fullName, 100),
        customer_email: clean(body.email, 120),
        whatsapp_number: clean(body.phone, 30),
        dob: clean(body.dob, 30),
        birth_time: clean(body.tob, 30),
        birth_place: clean(body.pob, 120),
        gender: clean(body.gender, 30),
        report_language: clean(body.reportLanguage, 30)
      }
    });

    if (Number(order.amount) !== amountPaise) {
      throw new Error('Safety check failed: Razorpay order amount was not ₹51');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ flow: 'isht51-v6', order_id: order.id, amount: amountPaise, currency: 'INR', key_id })
    };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message || 'Could not create ₹51 booking order', flow: 'isht51-v6' }) };
  }
};
