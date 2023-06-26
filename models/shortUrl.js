const mongoose = require('mongoose')

const shortUrlSchema = new mongoose.Schema({
    full : {
        type : String,
        required : true
    },
    short : {
        type : String,
        required : true
    },
    clicks : {
        type : Number,
        required : true,
        default : 0
    },
    userId: {
        type: String,
        required: true,
    },
    qrCode: {
        type: String,
        default: null,
      }
})


module.exports = mongoose.model('ShortUrl', shortUrlSchema)