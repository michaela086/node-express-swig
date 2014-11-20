var mongoose = require('mongoose');

module.exports = mongoose.model('Auction', {
	id: String,
    starting_bid: Number,
    current_bid: Number,
    buy_it_now: Number,
    active: Boolean
});