var mongoose = require('mongoose');
 
module.exports = mongoose.model('Admin', {
	username: String,
    password: String,
    email: String,
    gender: String,
    address: String
});