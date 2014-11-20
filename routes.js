app.get('/login', function(req, res) {
    loadGlobalData(req, function (globalData) {
        res.render('login', {
            globalData: globalData,
            title: 'Login',
            message: req.flash('error')
        });
    });
});

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

app.get('/', ensureAuthenticated, function(req, res) {
    loadGlobalData(req, function (globalData) {
        res.render('index', {
            globalData: globalData,
            title: 'My Auction',
        });
    });
});

app.get('/auction/*', function(req, res) {
    loadGlobalData(req, function (globalData) {
        loadAuctionData(req, function (auctionData) {
            if (req.params[0]) {
                res.render('auction', {
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

app.post('/bid', ensureAuthenticated, function(req, res) {
    res.send('success');
    bid = req.body.bid;
    io.sockets.in(req.body.auctionId).emit('updateAuctionData', bid);
});

app.post('/login',
    passport.authenticate('local', { 
        failureRedirect: '/login', 
        failureFlash: true 
    }), function(req, res) {
        var redirectUrl = getUrlVars(req.headers.referer)["redirect"];
        res.redirect(redirectUrl != undefined ? redirectUrl : '/');
    }
);

function loadGlobalData(req, cb) {
    var data = {};
    if (req.user && req.user.username) {
        data.user = req.user.username;
    } else {
        data.user = '';
    }
    data.server = server_config.serverip;
    return cb(data);
}

function loadAuctionData(req, cb) {
    var data = {};
    data.id = req.params[0];
    data.bid = '324';
    return cb(data);
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
    return next();
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login?redirect='+req.url);
}
