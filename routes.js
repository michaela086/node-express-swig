app.post('/login',
    passport.authenticate('login', {
        failureRedirect: '/login',
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
    req.session.username = '';
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

app.get('/auth/google', passport.authenticate('google', { 
    scope: ['https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email']
    }
), function(req, res) {
});

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), function(req, res) {
    req.session.username = req.user.displayName;
    res.redirect(getLastUrl(req));
});

app.get('/auction/*', function(req, res) {
    req.session.lastUrl = req.url;
    loadGlobalData(req, function (globalData) {
        Auction.findOne({ 'id' :  req.params[0] }, function(err, auctionData) {
            if (auctionData) {
                res.render('auction', {
                    loginRequired: true,
                    globalData: globalData,
                    auctionData: auctionData,
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

app.post('/bid', function(req, res) {
    if (req.session.loggedIn) {
        newBid = req.body.newBid;
        Auction.findOne({ 'id' :  req.body.auctionId }, function(err, auctionData) {
            if (auctionData) {
                if (newBid > auctionData.current_bid) {
                    auctionData.current_bid = newBid;
                    auctionData.save(function(err) {
                        if (err){
                            res.send({ status: 'error', message: err });
                        }
                        res.send({ status: 'success', message: '' });
                        io.sockets.in(req.body.auctionId).emit('updateAuctionData', req.body.newBid, req.session.username + ' placed a bid of ' + newBid);
                    });
                } else {
                    res.send({ status: 'error', message: req.session.username + ' placed a invalid bid of ' + newBid });
                }
            }
        });
    } else {
        res.send({status: 'faled', message: 'User is not logged in'});
    }
});

function loadGlobalData(req, cb) {
    var data = {};
    if (req.session.username != undefined && req.session.username != '') {
        data.user = req.session.username;
        data.loggedIn = true;
    } else {
        if (req.user && req.user.username) {
            data.user = req.user.username;
            data.loggedIn = true;
        } else {
            data.user = '';
            data.loggedIn = false;
        }
    }
    if (data.loggedIn) { req.session.loggedIn = true; } else { req.session.loggedIn = false; }
    data.server = req.headers.host;
    return cb(data);
}

function isLoggedIn(req, cb) {
    var data = {};
    if (req.session.loggedIn) {
        data.loggedIn = true;
    } else {
        data.loggedIn = false;
    }    
    return cb(data);
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
