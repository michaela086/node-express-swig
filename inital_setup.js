//This will create the default settings if there are none

//models.Settings.remove(function (err) { if (err) return console.error(err); });
models.Settings.findOne(function(err, local_settings) {
    if (!local_settings) {
    	var localSettings = new models.Settings();

	    localSettings.website_name = 'Auction Site';
	    localSettings.website_title = 'Auction Title';
	    localSettings.minimal_bid_increase = '5.00';
	    localSettings.allow_high_bidder_increase_own_bid = '1';
	    localSettings.currency_symbol = '$';
	    localSettings.extend_auction_enable = '1';
        localSettings.extend_auction_add = '60';
        localSettings.extend_auction_within = '60';

	    localSettings.save(function(err) {
	        if (err){
	            console.log('Error while saving settings: '+err);  
	            throw err;  
	        }
	        console.log('\nLocal settings saved succesfully\n');    
	    });
    }
});

//models.Admin.remove(function (err) { if (err) return console.error(err); });
models.Admin.findOne(function(err, admin) {
	if (!admin) {
		var newAdmin = new models.Admin();

		newAdmin.username = 'admin';
		newAdmin.password = functions.createHash('admin');
		newAdmin.email = '';
		newAdmin.admin = true;

		newAdmin.save(function(err) {
		    if (err){
		        console.log('Error in Saving user: '+err);  
		        throw err;  
		    }
		    console.log('Admin Registration succesful');    
		});
	}
});
