var mongoose = require('mongoose');
 
module.exports = mongoose.model('Images', {
    auctionId: Number,
    title: String,
    alt: String,
    full: String,
    thumb: String
});