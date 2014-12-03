var mongoose = require('mongoose');
 
module.exports = mongoose.model('Settings', {
    saved: { type: Date, default: Date.now },
    website_name: String,
    website_title: String,
	minimal_bid_increase: Number,
	allow_high_bidder_increase_own_bid: Number,
	extend_auction_enable: Number,
    extend_auction_add: Number,
    extend_auction_within: Number,
	currency_symbol: String
});
