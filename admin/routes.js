app.post('/admin/login',
    passport.authenticate('adminLogin', {
        failureRedirect: '/admin/login',
        failureFlash : true  
    }), function(req, res) {
        res.redirect('/admin');
    }
);

app.get('/admin/login', function(req, res) {
    loadGlobalData(req, function (globalData) {
        res.render('admin/login', {
            globalData: globalData,
            title: 'Auction'
        });
    });
});

app.get('/admin/auctions', ensureAdminAuthenticated, function(req, res) {
    loadGlobalData(req, function (globalData) {
        loadAuctionsData(function (auctionsData) {
            res.render('admin/auctions', {
                globalData: globalData,
                title: 'Auction',
                auctions: auctionsData.auctions
            });
        });
    });
});

app.get('/admin/settings', ensureAdminAuthenticated, function(req, res) {
    loadGlobalData(req, function (globalData) {
        res.render('admin/settings', {
            globalData: globalData,
            title: 'Auction'
        });
    });
});

app.get('/admin/users', ensureAdminAuthenticated, function(req, res) {
    loadGlobalData(req, function (globalData) {
        models.User.find(function (err, Users) {
            console.log(Users);
            res.render('admin/users', {
                globalData: globalData,
                title: 'Users',
                users: Users
            });
        });
    });
});

app.post('/admin/settings', ensureAdminAuthenticated, function(req, res) {
    if (req.body) {
        var localSettings = new models.Settings();

        localSettings.website_name = req.body.website_name;
        localSettings.website_title = req.body.website_title;
        localSettings.minimal_bid_increase = req.body.minimal_bid_increase;
        localSettings.allow_high_bidder_increase_own_bid = req.body.allow_high_bidder_increase_own_bid;
        localSettings.extend_auction_enable = req.body.extend_auction_enable;
        localSettings.extend_auction_add = req.body.extend_auction_add;
        localSettings.extend_auction_within = req.body.extend_auction_within;
        localSettings.currency_symbol = req.body.currency_symbol;

        localSettings.save(function(err) {
            if (err){
                console.log('Error while saving settings: '+err);  
                throw err;  
            }
            console.log('Local settings saved succesfully');    
        });
    }
    res.redirect('/admin/settings');
});

app.get('/admin/auction/*', ensureAdminAuthenticated, function(req, res) {
    loadGlobalData(req, function (globalData) {
        loadAuctionData(req.params[0], function (auctionData) {
            models.Images.find({ 'auctionId': req.params[0] }, function(err, imageData) {
                res.render('admin/auction', {
                    globalData: globalData,
                    title: 'Auction',
                    auctionData: auctionData,
                    images: imageData
                });
            });
        });
    });
});

app.get('/admin/newAuction', ensureAdminAuthenticated, function(req, res) {
    loadGlobalData(req, function (globalData) {
        loadAuctionsData(function (auctionsData) {
            res.render('admin/new_auction', {
                globalData: globalData,
                title: 'Auction',
                auctions: auctionsData.auctions
            });
        });
    });
});

app.get('/admin', ensureAdminAuthenticated, function(req, res) {
    loadGlobalData(req, function (globalData) {
        res.render('admin/dashboard', {
            globalData: globalData,
            title: 'Admin'
        });
    });
});

app.get('/admin/deleteAuction', ensureAdminAuthenticated, function(req, res) {
    Auction.remove({ 'id' : req.query.id }, function (err) {
        if (err) return console.error(err);
    });
    res.redirect('/admin/auctions');
});

app.post('/admin/newAuction', ensureAdminAuthenticated, function(req, res) {
    var newAuction = new models.Auction();

    newAuction.id = req.body.id;
    newAuction.starting_bid = req.body.starting_bid;
    newAuction.current_bid = req.body.starting_bid;
    newAuction.buy_it_now = req.body.buy_it_now;
    newAuction.active = true;

    newAuction.save(function(err) {
        if (err){
            console.log('Error Saving auction "'+ req.body.id +'": '+err);  
            throw err;  
        }
    });
    res.redirect('/admin/auctions');
});

app.post('/admin/imageUpload', ensureAdminAuthenticated, function (req, res) {
    data = {};
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        data.title = fields.title;
        data.id = fields.auctionId;
    });

    form.on('end', function(fields, files) {
        if (this.openedFiles[0].size > 0) {
            var temp_path = this.openedFiles[0].path;
            
            var file_ext = this.openedFiles[0].name;
            
            var file_name = Date.now()+file_ext;

            var new_location = 'public/img/full/';
            var full_path = new_location + file_name;

            fs.copy(temp_path, full_path, function(err) {  
                if (err) {
                    console.error(err);
                } else {
                    var image = new models.Images();

                    image.auctionId = data.id;
                    image.title = data.title;
                    image.full = '/img/full/'+file_name;
                    image.thumb = '/img/full/'+file_name;

                    image.save(function(err) {
                        if (err){
                            console.log('Error in Saving image: '+err);  
                            throw err;  
                        }
                        console.log('Image saved successfully');
                        res.redirect(req.headers.referer);
                    });
                }
            });
        }
    });
});

app.get('/admin/imageRemove', ensureAdminAuthenticated, function(req, res) {
    models.Images.remove({ '_id' : req.query.id }, function (err) {
        if (err) return console.error(err);
    });
    res.redirect(req.headers.referer);
});

function ensureAdminAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/admin/login');
}

function loadAuctionsData(cb) {
    var data = {};
    models.Auction.find(function (err, Auctions) {
        Auctions.forEach(function(Auction){
            console.log(Auction.id);
        });
        models.Images.find(function (err, AuctionImages) {
            if (err) return console.error(err);
                data.auctions = Auctions;
                data.images = AuctionImages;
                return cb(data);
            });
        });
}

function loadAuctionData(id, cb) {
    models.Auction.findOne({ 'id' : id }, function (err, AuctionData) {
        if (err) return console.error(err);
            return cb(AuctionData);
        });
}
