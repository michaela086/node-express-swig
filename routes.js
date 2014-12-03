app.post('/login',
    passport.authenticate('login', {
        failureRedirect: '/login?failed=true',
        failureFlash : true  
    }), function(req, res) {
        res.redirect(getLastUrl(req));
    }
);

app.post('/signup', passport.authenticate('signup', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash : true  
}));

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

app.get('/', function(req, res) {
    loadGlobalData(req, function (globalData) {
        res.render('index', {
            globalData: globalData,
            title: 'Auction',
            chat_room: req.params[0]
        });
    });
});

app.get('/signup', function(req, res) {
    loadGlobalData(req, function (globalData) {
        res.render('signup', {
            globalData: globalData,
            title: 'My Chat'
        });
    });
});

app.get('/login', function(req, res) {
    loadGlobalData(req, function (globalData) {
        res.render('login', {
            globalData: globalData,
            title: 'My Chat'
        });
    });
});

app.get('/auction/*', function(req, res) {
    req.session.lastUrl = req.url;
    loadGlobalData(req, function (globalData) {
        models.Auction.findOne({ 'id' :  req.params[0] }, function(err, auctionData) {
            models.Images.find({ 'auctionId': req.params[0] }, function(err, imageData) {
                console.log(imageData);
                if (auctionData) {
                    res.render('auction', {
                        globalData: globalData,
                        auctionData: auctionData,
                        images: imageData,
                        title: 'My Auction'
                    });
                } else {
                    res.render('error', {
                        globalData: globalData,
                        title: 'My Auction',
                        message: 'Invalid auction'
                    });
                }
            });
        });
    });
});

app.get('/myaccount', ensureAuthenticated, function(req, res) {
    loadGlobalData(req, function (globalData) {
        res.render('myaccount/home', {
            globalData: globalData,
            title: 'My Account'
        });
    });
});

app.get('/myaccount/newauction', ensureAuthenticated, function(req, res) {
    loadGlobalData(req, function (globalData) {
        res.render('myaccount/newauction', {
            globalData: globalData,
            title: 'New Auction'
        });
    });
});

app.get('/myaccount/personalinfo', ensureAuthenticated, function(req, res) {
    loadGlobalData(req, function (globalData) {
        res.render('myaccount/personalinfo', {
            globalData: globalData,
            title: 'My Info'
        });
    });
});

app.get('/myaccount/auctionsbidon', ensureAuthenticated, function(req, res) {
    loadGlobalData(req, function (globalData) {
        res.render('myaccount/auctionsbidon', {
            globalData: globalData,
            title: 'Auctions Bid On'
        });
    });
});

app.get('/myaccount/auctionswon', ensureAuthenticated, function(req, res) {
    loadGlobalData(req, function (globalData) {
        res.render('myaccount/auctionswon', {
            globalData: globalData,
            title: 'Auctions Won'
        });
    });
});

app.get('/myaccount/auctionslost', ensureAuthenticated, function(req, res) {
    loadGlobalData(req, function (globalData) {
        res.render('myaccount/auctionslost', {
            globalData: globalData,
            title: 'Auctions Lost'
        });
    });
});

app.get('/myaccount/auctionswatching', ensureAuthenticated, function(req, res) {
    loadGlobalData(req, function (globalData) {
        res.render('myaccount/auctionswatching', {
            globalData: globalData,
            title: 'Auctions Watching'
        });
    });
});

app.post('/bid', ensureAuthenticated, function(req, res) {
    if (req.user) {
        loadGlobalData(req, function (globalData) {
            newBid = req.body.newBid;
            models.Auction.findOne({ 'id' : req.body.auctionId }, function(err, auctionData) {
                if (auctionData) {
                    minimal_bid = auctionData.current_bid + globalData.settings.minimal_bid_increase;
                    if (newBid > auctionData.current_bid) {
                        if (newBid >= minimal_bid) {
                            auctionData.current_bid = newBid;
                            auctionData.save(function(err) {
                                if (err){
                                    res.send({ status: 'error', message: err });
                                }
                                res.send({ status: 'success', message: '' });
                                io.sockets.in(req.body.auctionId).emit('updateAuctionData', req.body.newBid, req.user.displayname + ' placed a bid of ' + newBid);
                            });
                        } else {
                            res.send({ status: 'error', message: req.user.displayname + ' not big enough, must be atleast ' + minimal_bid });
                        }
                    } else {
                        res.send({ status: 'error', message: req.user.displayname + ' placed a invalid bid of ' + newBid });
                    }
                } else {
                    res.send({ status: 'error', message: 'There was an issue placeing a bid of ' + newBid });
                }
            });
        });
    } else {
        res.send({status: 'failed', message: 'User is not logged in'});
    }
});

function loadGlobalData(req, cb) {
    models.Settings.findOne({}, {}, { sort: { 'saved' : -1 } }, function(err, local_settings) {
        var data = {};
        data.user = req.user;
        data.settings = local_settings;
        data.server = req.headers.host;
        console.log(data);
        return cb(data);
    });
}

function getLastUrl(req) {
    lastUrl = req.session.lastUrl != undefined ? req.session.lastUrl : '/';
    return (lastUrl);
}

function getUrlVars(url) {
    var vars = [], hash;
    var hashes = url.slice(url.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login');
}
