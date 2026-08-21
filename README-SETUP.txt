ISHT DEVTA DISCOVERY - V8.3 FINAL VALIDATED
Black Glass + ₹51 Booking + Optional Dakshina + Moderated Reviews

WHY THIS BUILD IS DIFFERENT
- It deliberately uses the SAME .js/Lambda-compatible function format as the payment backend that is already working on this site.
- The review data layer now calls @netlify/blobs connectLambda(event) before getStore(), which is required for Blobs environment configuration in Lambda-compatible functions.
- Because the review function filenames stay .js, uploading this build replaces the existing GitHub review files directly. No manual deletion or .mjs migration is required.

BEFORE DEPLOY
Confirm these Netlify environment variables already exist:
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- REVIEW_ADMIN_SECRET

DEPLOY
1. Replace/upload the CONTENTS of this folder to the existing GitHub repository.
2. index.html must remain at repository root.
3. netlify/functions should contain review-health.js plus the four review .js files.
4. Let Netlify perform one production deploy.
5. Run FINAL-DEPLOY-VALIDATION-V8.3.txt in order.

PAYMENT FLOW
- Main booking: ₹51, server-hardcoded to 5100 paise.
- Dakshina: ₹121 / ₹201 / custom ₹121+.
- Navagrah: ₹99, server-hardcoded to 9900 paise.
- All existing V6 payment/verification functions are preserved byte-for-byte.

REVIEW FLOW
- 10 original reviews are embedded in index.html as a permanent outage fallback.
- The same 10 reviews seed Netlify Blobs the first time the review backend is used.
- Dakshina page can save private feedback or public-permission feedback.
- Public permission OFF => Private, cannot be approved publicly.
- Public permission ON => Pending until you approve it.
- Admin page: /review-admin.html
- Admin can Approve, Reject, Unpublish, Feature, Mark/Remove Verified, Reply/Clear Reply.
- Approved reviews join the same moving landing-page review strip.
- Customer phone/email are never returned by the public review endpoint.

NETLIFY FORMS BACKUP
Form name: isht-dakshina-feedback
The Dakshina page also saves a private Forms copy before the moderation copy. If the review store is temporarily unavailable, the page now tells the customer their feedback was safely received rather than falsely saying everything failed.
