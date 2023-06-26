const express = require('express');
const app = express();
const session = require('express-session');
const ShortUrl = require('./models/shortUrl');
const shortId = require('shortid');
const NodeCache = require('node-cache');
const cache = new NodeCache();
const rateLimit = require('express-rate-limit');

require('dotenv').config();
require('./db/mongoDb').connectToMongoDB();

const PORT = process.env.PORT || 8900;

// Middleware setup
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set('view engine', 'ejs');

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // maximum of 100 requests per windowMs
});

app.use(limiter);

// Session setup
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  })
);

app.get('/', async (req, res) => {
  let userId = req.session.userId;
  if (!userId) {
    userId = shortId.generate();
    req.session.userId = userId;
  }

  let shortUrls = cache.get(userId);

  if (!shortUrls) {
    shortUrls = await ShortUrl.find({ userId });
    cache.set(userId, shortUrls);
  }

  res.render('index', { shortUrls });
});

app.get('/:test', async (req, res) => {
  const shortUrl = await ShortUrl.findOne({
    short: req.params.test,
    userId: req.session.userId,
  });

  if (shortUrl == null) {
    console.log('Short URL not found');
    return res.sendStatus(404);
  }

  console.log(shortUrl.full);

  shortUrl.clicks++;
  shortUrl.save();

  res.redirect(shortUrl.full);
});

app.post('/shortUrls', async (req, res) => {
  let longUrl = req.body.fullUrl;
  let customUrl = req.body.customUrl;

  console.log(longUrl, customUrl);

  let userId = req.session.userId;

  if (!userId) {
    // Generate a unique userId for the user
    userId = shortId.generate();
    req.session.userId = userId;
  }

  if (!customUrl) {
    let shortenedUrl = generateShortUrl(longUrl);
    let mainShortenedUrl = 'trim.ly.' + shortenedUrl;
    await ShortUrl.create({ full: req.body.fullUrl, short: mainShortenedUrl, userId });
    console.log(mainShortenedUrl);
  } else {
    let shortenedUrl = customUrl;
    let mainShortenedUrl = 'trim.ly.' + shortenedUrl;
    await ShortUrl.create({ full: req.body.fullUrl, short: mainShortenedUrl, userId });
    console.log(mainShortenedUrl);
  }

  // Clear the cache for the user to ensure fresh data is fetched
  cache.del(userId);

  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Server running successfully on port ${PORT}`);
});

function generateShortUrl(longUrl) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let shortenedUrl = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    shortenedUrl += chars.charAt(randomIndex);
  }
  return shortenedUrl;
}
