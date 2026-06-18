const Razorpay = require('razorpay');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Razorpay keys are missing' }) };
    }

    const body = JSON.parse(event.body || '{}');
    const amount = 20100;

    const razorpay = new Razorpay({ key_id, key_secret });
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: 'isht_' + Date.now(),
      notes: {
        amount: '201',
        customer_name: body.fullName || '',
        customer_email: body.email || '',
        whatsapp_number: body.phone || '',
        dob: body.dob || '',
        birth_time: body.tob || '',
        birth_place: body.pob || '',
        report_language: body.reportLanguage || '',
        notes: body.notes || ''
      }
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message || 'Could not create Razorpay order' })
    };
  }
};
