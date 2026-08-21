const crypto = require('crypto');

const STORE_NAME = 'isht-devta-reviews';
const REVIEW_PREFIX = 'review/';

const SEED_REVIEWS = [
  { id:'seed-01-sai-priya', displayName:'Sai Priya', fullName:'Sai Priya', city:'Bangalore', stars:4, feedback:'I always had a pull towards certain deities. Seeing my report, I really understood the connection. Now I am able to take my sadhana forward to the next level.', reply:'', sortOrder:1 },
  { id:'seed-02-shailesh', displayName:'Shailesh', fullName:'Shailesh', city:'Surat', stars:5, feedback:'My long-term doubt is finally cleared and I found my Ishta Devi. The report gave me a clear devotional direction.', reply:'', sortOrder:2 },
  { id:'seed-03-ankur-mishra', displayName:'Ankur Mishra', fullName:'Ankur Mishra', city:'Delhi', stars:4, feedback:'Report was good. I already had a feeling Hanuman Ji is my Isht, so this report confirmed it. But I would not recommend it if you want a fast result, because I had to wait the full 24 hours.', reply:'We apologize for not meeting your expectations. This is a manual report that requires multiple checks, so it cannot be delivered like instant computer-generated reports. We take pride in giving an accurate report rather than a rushed one. Thank you for your understanding. Namaste 🙏', sortOrder:3 },
  { id:'seed-04-anjan-mandal', displayName:'Anjan Mandal', fullName:'Anjan Mandal', city:'Kolkata', stars:5, feedback:'They revealed my Isht Devta. I am happy with the result and can now direct my puja and meditation in the right direction.', reply:'', sortOrder:4 },
  { id:'seed-05-prabhu', displayName:'Prabhu', fullName:'Prabhu', city:'Chennai', stars:5, feedback:"It's helpful and I am getting good result in my upasana.", reply:'', sortOrder:5 },
  { id:'seed-06-aarya-singh', displayName:'Aarya Singh', fullName:'Aarya Singh', city:'Bokaro Steel City', stars:5, feedback:'Nice and prompt service.', reply:'', sortOrder:6 },
  { id:'seed-07-ashik-rai', displayName:'Ashik Rai', fullName:'Ashik Rai', city:'Bengaluru', stars:5, feedback:"I'm thankful and satisfied with the recommendation.", reply:'', sortOrder:7 },
  { id:'seed-08-anonymous-trivandrum', displayName:'Anonymous', fullName:'Anonymous', city:'Trivandrum, Kerala', stars:5, feedback:'My family temple was of Durga Kali and Lord Muruga, but I have been devoted to Lord Krishna since childhood and felt confused about my Ishta Devata. Thank you very much for the guidance.', reply:'', sortOrder:8 },
  { id:'seed-09-anonymous-bangalore', displayName:'Anonymous', fullName:'Anonymous', city:'Bangalore', stars:5, feedback:'Good job.', reply:'', sortOrder:9 },
  { id:'seed-10-anonymous-kozhikode', displayName:'Anonymous', fullName:'Anonymous', city:'Kozhikode', stars:5, feedback:'Very clear and precise report.', reply:'', sortOrder:10 }
];

async function getReviewStore(event) {
  // This site's existing backend uses Netlify's Lambda-compatible .js function format.
  // @netlify/blobs requires connectLambda(event) before getStore() in this format.
  const { connectLambda, getStore } = await import('@netlify/blobs');
  connectLambda(event);
  return getStore({ name: STORE_NAME, consistency: 'strong' });
}

function clean(value, max = 5000) {
  return String(value ?? '').replace(/\u0000/g, '').trim().slice(0, max);
}

function normalizeStars(value) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
}

function firstNameOnly(name) {
  const c = clean(name, 100);
  if (!c || /^anonymous$/i.test(c)) return 'Anonymous';
  return c.split(/\s+/)[0];
}

function reviewKey(id) {
  return REVIEW_PREFIX + clean(id, 160).replace(/[^a-zA-Z0-9._-]/g, '-');
}

function createId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
}

function seedValue(seed) {
  const createdAt = '2026-08-21T00:00:00.000Z';
  return {
    ...seed,
    publicConsent: true,
    status: 'approved',
    verifiedCustomer: true,
    featured: seed.sortOrder <= 4,
    source: 'existing-site-testimonial',
    createdAt,
    approvedAt: createdAt,
    updatedAt: createdAt,
    phone: '',
    dakshinaAmount: '',
    paymentStatus: 'legacy-existing-review',
    paymentId: '',
    orderId: ''
  };
}

async function ensureSeedReviews(event) {
  const store = await getReviewStore(event);
  // Use only documented Blobs operations. Never overwrite a seed that you have moderated.
  for (const seed of SEED_REVIEWS) {
    const key = reviewKey(seed.id);
    const existing = await store.getMetadata(key);
    if (existing === null) {
      await store.setJSON(key, seedValue(seed));
    }
  }
  return store;
}

async function listAllReviews(event) {
  const store = await ensureSeedReviews(event);
  const { blobs } = await store.list({ prefix: REVIEW_PREFIX });
  const rows = [];
  for (const { key } of blobs) {
    try {
      const value = await store.get(key, { type: 'json' });
      if (value && typeof value === 'object') rows.push(value);
    } catch (_) {
      // One bad record must not make the whole testimonial strip fail.
    }
  }
  return rows;
}

async function getReview(event, id) {
  const store = await ensureSeedReviews(event);
  return store.get(reviewKey(id), { type: 'json' });
}

async function saveReview(event, review) {
  const store = await getReviewStore(event);
  await store.setJSON(reviewKey(review.id), review);
  return review;
}

async function createReview(event, input) {
  const store = await ensureSeedReviews(event);
  const fullName = clean(input.fullName || input.name, 100);
  const city = clean(input.city, 100);
  const feedback = clean(input.feedback, 2400);
  const stars = normalizeStars(input.stars || input.rating);
  const publicConsent = [true, 'true', 'yes', 'on'].includes(input.publicConsent);

  if (!stars && !feedback) {
    const error = new Error('Please add a star rating or feedback.');
    error.statusCode = 400;
    throw error;
  }
  if (publicConsent && (!fullName || !city || !feedback)) {
    const error = new Error('Name, city and feedback are required when you allow the review to be displayed publicly.');
    error.statusCode = 400;
    throw error;
  }

  const now = new Date().toISOString();
  const id = createId();
  const review = {
    id,
    fullName,
    displayName: publicConsent ? firstNameOnly(fullName) : '',
    city,
    phone: clean(input.phone, 30),
    stars,
    feedback,
    publicConsent,
    status: publicConsent ? 'pending' : 'private',
    verifiedCustomer: false,
    featured: false,
    reply: '',
    source: clean(input.source || 'dakshina-page', 80),
    createdAt: now,
    approvedAt: '',
    updatedAt: now,
    sortOrder: Date.now(),
    dakshinaAmount: clean(input.dakshinaAmount || input.amount, 20),
    paymentStatus: clean(input.paymentStatus, 80),
    paymentId: clean(input.paymentId, 160),
    orderId: clean(input.orderId, 160)
  };
  await store.setJSON(reviewKey(id), review);
  return review;
}

function publicReviewShape(review) {
  return {
    id: clean(review.id, 160),
    displayName: clean(review.displayName || firstNameOnly(review.fullName), 80),
    city: clean(review.city, 100),
    stars: normalizeStars(review.stars) || 5,
    feedback: clean(review.feedback, 2400),
    verifiedCustomer: review.verifiedCustomer === true,
    featured: review.featured === true,
    reply: clean(review.reply, 1200)
  };
}

function safeEqualSecret(a, b) {
  const aa = Buffer.from(String(a || ''), 'utf8');
  const bb = Buffer.from(String(b || ''), 'utf8');
  return aa.length === bb.length && aa.length > 0 && crypto.timingSafeEqual(aa, bb);
}

function requireAdmin(event) {
  const expected = process.env.REVIEW_ADMIN_SECRET;
  if (!expected) {
    const error = new Error('REVIEW_ADMIN_SECRET is not configured in Netlify environment variables.');
    error.statusCode = 503;
    throw error;
  }
  const headers = event.headers || {};
  const header = headers.authorization || headers.Authorization || '';
  const token = String(header).replace(/^Bearer\s+/i, '');
  if (!safeEqualSecret(token, expected)) {
    const error = new Error('Unauthorized');
    error.statusCode = 401;
    throw error;
  }
}

module.exports = {
  SEED_REVIEWS,
  clean,
  normalizeStars,
  listAllReviews,
  getReview,
  saveReview,
  createReview,
  publicReviewShape,
  requireAdmin
};
