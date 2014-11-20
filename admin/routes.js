var Auction = require('./models/auction');

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

app.get('/admin/auction/*', ensureAdminAuthenticated, function(req, res) {
    loadGlobalData(req, function (globalData) {
        loadAuctionData(req.params[0], function (auctionData) {
            console.log(auctionData);
            res.render('admin/auction', {
                globalData: globalData,
                title: 'Auction',
                auctionData: auctionData
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
            title: 'Auction'
        });
    });
});

app.post('/admin/newAuction', function(req, res) {
    var newAuction = new Auction();

    newAuction.id = req.body.id;
    newAuction.starting_bid = req.body.starting_bid;
    newAuction.current_bid = req.body.starting_bid;
    newAuction.buy_it_now = req.body.buy_it_now;
    newAuction.active = true;

    newAuction.save(function(err) {
        if (err){
            console.log('Error in Saving auction: '+err);  
            throw err;  
        }
    });
    res.redirect('/admin/auctions');
});

function ensureAdminAuthenticated(req, res, next) {
    return next();
    if (req.session.isAdmin) { return next(); }
    res.redirect('/admin/login');
}

function loadAuctionsData(cb) {
    var data = {};
    Auction.find(function (err, Auctions) {
        if (err) return console.error(err);
            data.auctions = Auctions;
            return cb(data);
        });
}

function loadAuctionData(id, cb) {
    Auction.findOne({ 'id' : id }, function (err, AuctionData) {
        if (err) return console.error(err);
            return cb(AuctionData);
        });
}
