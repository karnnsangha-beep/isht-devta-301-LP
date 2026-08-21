exports.handler = async () => ({
  statusCode: 200,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify({
    ok: true,
    version: 'isht-funnel-v6',
    booking_rupees: 51,
    dakshina_min_rupees: 121,
    navagrah_rupees: 99,
    functions: ['create-isht51-order','create-dakshina-v2-order','create-navagrah99-order','verify-isht-payment']
  })
});
