exports.handler = async () => ({
  statusCode: 200,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify({
    ok: true,
    version: 'isht-funnel-v9-201',
    report_rupees: 201,
    navagrah_addon_rupees: 99,
    report_with_addon_rupees: 300,
    optional_review_dakshina_min_payable_rupees: 1,
    functions: ['create-isht201-order','create-dakshina-v2-order','create-navagrah99-order','verify-isht-payment','review-health']
  })
});
