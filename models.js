var mongoose = require('mongoose');
 
module.exports.Admin = mongoose.model('Admin', {
	username: String,
    password: String,
    email: String,
    admin: Boolean
});

module.exports.Auction = mongoose.model('Auction', {
	id: String,
    starting_bid: Number,
    current_bid: Number,
    buy_it_now: Number,
    active: Boolean
});

module.exports.Images = mongoose.model('Images', {
    auctionId: Number,
    title: String,
    alt: String,
    full: String,
    thumb: String
});

module.exports.Settings = mongoose.model('Settings', {
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

module.exports.User = mongoose.model('User', {
	username: String,
    password: String,
    email: String,
    displayname: String,
    phone: Number
});
