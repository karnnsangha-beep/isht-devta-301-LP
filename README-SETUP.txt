ISHT DEVTA DISCOVERY - ₹51 BOOKING SHAGUN + OPTIONAL DAKSHINA

DEPLOY
1. Upload the CONTENTS of this folder to the existing GitHub repo so index.html is at repo root.
2. Netlify should remain connected to the same repo/site.
3. Keep these existing Netlify environment variables:
   RAZORPAY_KEY_ID
   RAZORPAY_KEY_SECRET
4. Ensure Netlify Forms / Form detection is enabled, then redeploy.
5. Run one live/test booking flow and one Dakshina flow before sending traffic.

MAIN LANDING PAGE
- File: index.html
- ₹51 is hard-coded server-side as the Booking Shagun.
- Report delivery: 24-48 hours on WhatsApp.
- No compulsory balance is due after ₹51.
- Dakshina is only after delivery and only if the customer is satisfied.
- Meta Purchase event value is ₹51.
- The previous Navagrah add-on is intentionally removed from this test to keep the offer simple.

DAKSHINA + FEEDBACK PAGE
- File: dakshina.html
- Send this page WITH the completed report.
- Rating: optional 1-5 stars.
- Feedback: optional private text.
- Customer can choose “No Dakshina • Submit Feedback”.
- Paid Dakshina opens Razorpay Checkout.
- Rating + feedback preview are placed in Razorpay Order notes for paid Dakshina.
- Full feedback, rating, amount, payment status, payment ID and order ID are saved privately through Netlify Forms.

NETLIFY FORMS
Form name: isht-dakshina-feedback
Submissions appear in the private Netlify site dashboard under Forms.
They are NOT displayed publicly by this website.

SERVERLESS FUNCTIONS
- netlify/functions/create-order.js -> fixed ₹51 booking order
- netlify/functions/create-dakshina-order.js -> validates selected/custom Dakshina
- netlify/functions/verify-payment.js -> verifies Razorpay signature

IMPORTANT
The Dakshina page works locally for layout preview, but Netlify Forms and Razorpay server functions only work after deployment through Netlify.

AUG 21 V2 FLOW
- Main Isht Devta page: ₹51 Booking Shagun only. No add-on shown before the report.
- Dakshina page: ₹121 / ₹201 (Most Common) / Custom ₹121+, plus feedback-only with no payment.
- Paid Dakshina redirects to navagrah.html after Razorpay verification.
- Navagrah customer offer: ₹99 (₹299 struck out), separate Razorpay payment, order saved via Netlify Forms.
- Feedback-only submissions do NOT redirect to the Navagrah offer.
