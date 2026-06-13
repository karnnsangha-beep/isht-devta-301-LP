ISHT DEVTA DISCOVERY LP - Glass Black + Antique Gold

This folder is independently deployable on Netlify.

Required:
1. Deploy this folder.
2. Enable Netlify Forms.
3. Add environment variables:
   RAZORPAY_KEY_ID
   RAZORPAY_KEY_SECRET
4. In index.html, set SITE_CONFIG.META_PIXEL_ID before launch.
5. Run one Razorpay test payment first.

Customer details flow:
LP form -> Razorpay checkout popup -> payment verification -> Netlify Forms backup.

No public-facing technical identification method disclosure is included in this version.


FINAL CONFIG ADDED
- Meta Pixel ID baked into index.html: 871049705466459
- Post-sale redirect after verified payment: https://tinyurl.com/e466s5sw
- Netlify Forms backup remains enabled through the hidden form and submitNetlifyBackup() after successful payment verification.
- Payment flow remains: LP form -> Razorpay checkout popup -> Netlify function verification -> Netlify Forms backup -> Meta Purchase event -> WhatsApp redirect.
