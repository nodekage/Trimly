const express = require('express');
const app = express();
const session = require('express-session');
const ShortUrl = require('./models/shortUrl');
const shortId = require('shortid');

require('dotenv').config();
require('./db/mongoDb').connectToMongoDB();

const PORT = process.env.PORT || 8900;

// Middleware setup
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set('view engine', 'ejs');

// Session setup
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  })
);

app.get('/', async (req, res) => {
  const shortUrls = await ShortUrl.find({ userId: req.session.userId });
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
