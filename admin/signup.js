var Admin = require('./models/admin');
var bCrypt = require('bcrypt-nodejs');

var username = 'mike';
var password = 'pass';
var email = 'mike.miller@email.com';
var firstName = 'Mike';
var lastName = 'Miller';

var createHash = function(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

Admin.findOne({ 'username' :  username }, function(err, admin) {
	if (admin) {
		console.log('admin already created');
	} else {
		var newAdmin = new Admin();

		newAdmin.username = username;
		newAdmin.password = createHash(password);
		newAdmin.email = email;
		newAdmin.firstName = firstName;
		newAdmin.lastName = lastName;

		newAdmin.save(function(err) {
		    if (err){
		        console.log('Error in Saving user: '+err);  
		        throw err;  
		    }
		    console.log('User Registration succesful');    
		});
	}
});

