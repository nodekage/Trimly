const express = require('express')
const app = express()
const ShortUrl = require('./models/shortUrl')


require('dotenv').config();
require('./db/mongoDb').connectToMongoDB()

const PORT = process.env.PORT || 8900;

app.use(express.urlencoded({ extended: false }));
app.use(express.json())

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('index')
})


app.post('/shortUrls', (req, res) => {
    let longUrl = req.body.fullUrl
    let customUrl = req.body.customUrl

    console.log( longUrl , customUrl)

    if (!customUrl) {
        console.log("NO CUSTOM NAME")
    }

    res.redirect('/')

})



app.listen(PORT, () => {
    console.log(`Server running sucessfully on port ${PORT}`)
})


