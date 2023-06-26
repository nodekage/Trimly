const express = require('express');
const app = express();
const session = require('express-session');
const ShortUrl = require('./models/shortUrl');
const shortId = require('shortid');
const NodeCache = require('node-cache');
const cache = new NodeCache();
const rateLimit = require('express-rate-limit');
const QRCode = require('qrcode');
const fs = require('fs');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);


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

  let shortUrls = await ShortUrl.find({ userId });
  console.log(shortUrls + "mamamia")

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
  await shortUrl.save();
  cache.set(req.session.userId, shortUrl); // Update the cache with the modified shortUrl object

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

  // Generate the QR code
  const qrCodeImageBuffer = await generateQRCode(mainShortenedUrl);
  console.log(qrCodeImageBuffer)


    await ShortUrl.create({ full: req.body.fullUrl, short: mainShortenedUrl, userId });

      // Save the QR code image to the database
      await saveQRCodeToDatabase(qrCodeImageBuffer, mainShortenedUrl, userId);
    console.log(mainShortenedUrl);
  } else {
    let shortenedUrl = customUrl;
    let mainShortenedUrl = 'trim.ly.' + shortenedUrl;
        
  // Generate the QR code
  const qrCodeImageBuffer = await generateQRCode(mainShortenedUrl);


    await ShortUrl.create({ full: req.body.fullUrl, short: mainShortenedUrl, userId });

      // Save the QR code image to the database
      await saveQRCodeToDatabase(qrCodeImageBuffer, mainShortenedUrl, userId);
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

async function generateQRCode(text) {
  try {
    const qrCodeImageBuffer = await QRCode.toBuffer(text);
    console.log('QR code generated successfully');
    return qrCodeImageBuffer;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
}


async function saveQRCodeToDatabase(qrCodeImageBuffer, shortUrl, userId) {
  try {
    if (qrCodeImageBuffer) {
      // Convert the Buffer to base64 encoded string
      const qrCodeImageBase64 = qrCodeImageBuffer.toString('base64');

      // Save the QR code image to the database
      const result = await ShortUrl.updateOne(
        { short: shortUrl, userId: userId },
        { qrCode: qrCodeImageBase64 }
      );

      console.log('Update result:', result);
    } else {
      console.log('QR code image buffer is null');
    }
  } catch (error) {
    console.error('Error saving QR code to the database:', error);
  }
}


