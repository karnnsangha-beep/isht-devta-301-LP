ISHT DEVTA LP V9 — ₹201 + REVIEWS

Current customer funnel
1. Main landing page: /
   - Complete Isht Devta Discovery Report: ₹201
   - Optional Navagrah Remedies checkout add-on: ₹99
   - Total with add-on: ₹300
2. Report delivered on WhatsApp within 24-48 hours.
3. Send customer the review URL after delivery: /review
   - Review submission is the primary action.
   - Optional post-delivery Dakshina exists only on the review page: ₹51 or custom whole-rupee amount.
   - There is no set custom minimum; payment processor requires at least ₹1.
4. After review submission, customer is taken to the ₹99 Navagrah Remedies customer offer.

Review moderation
- Review backend, Netlify Blobs store, OG 10 reviews, approval/reject/feature/reply controls are preserved from the working V8.4 build.
- Admin URL: /review-admin.html
- Netlify environment variable required: REVIEW_ADMIN_SECRET
- Health URL: /api/review-health

Payment environment variables
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET

Important routes
- /review rewrites to review.html
- /dakshina and /dakshina.html permanently redirect to /review for old links.

Deploy the entire folder so nested netlify/functions and netlify/lib files are included.
