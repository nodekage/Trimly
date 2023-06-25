const express = require('express')
const app = express()
const ShortUrl = require('./models/shortUrl')
const shortId = require('shortid')


require('dotenv').config();
require('./db/mongoDb').connectToMongoDB()

const PORT = process.env.PORT || 8900;

app.use(express.urlencoded({ extended: false }));
app.use(express.json())

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('index')
})


app.post('/shortUrls', async (req, res) => {
    let longUrl = req.body.fullUrl
    let customUrl = req.body.customUrl

    console.log( longUrl , customUrl)

    if (!customUrl) {
        let shortenedUrl = generateShortUrl(longUrl);
        let mainShortenedUrl =  "trim.ly/" + shortenedUrl
        await ShortUrl.create({ full: req.body.fullUrl,
            short: mainShortenedUrl
         })
         console.log(mainShortenedUrl)
    } else {
        let shortenedUrl = customUrl;
        let mainShortenedUrl =  "trim.ly/" + shortenedUrl
        await ShortUrl.create({ full: req.body.fullUrl,
            short: mainShortenedUrl
         })
        console.log(mainShortenedUrl)
    }

    res.redirect('/')
})



app.listen(PORT, () => {
    console.log(`Server running sucessfully on port ${PORT}`)
})


function generateShortUrl(longUrl) {

    // Logic for generating the shortened URL
    // You can use a library or custom logic here
    // For simplicity, let's assume it's a random 6-character alphanumeric string
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let shortenedUrl = '';
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      shortenedUrl += chars.charAt(randomIndex);
    }
    return shortenedUrl;
  }