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
    req.session.user = '';
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

app.get('/auth/google', passport.authenticate('google', { 
    scope: ['https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email']
    }
), function(req, res) {
});

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), function(req, res) {
    req.session.user = req.user.displayName;
    res.redirect(getLastUrl(req));
});

app.get('/auction/*', function(req, res) {
    console.log(req.url);
    req.session.lastUrl = req.url;
    loadGlobalData(req, function (globalData) {
        Auction.findOne({ 'id' :  req.params[0] }, function(err, auctionData) {
            Images.find({ 'auctionId': req.params[0] }, function(err, imageData) {
                console.log('imageData');
                console.log(imageData);
            });
            images = [{full: '/img/imgres-1.jpg', thumbnail: '/img/imgres-1.jpg'},
                      {full: '/img/imgres-2.jpg', thumbnail: '/img/imgres-2.jpg'},
                      {full: '/img/imgres-3.jpg', thumbnail: '/img/imgres-3.jpg'},
                      {full: '/img/imgres-4.jpg', thumbnail: '/img/imgres-4.jpg'},
                      {full: '/img/imgres-5.jpg', thumbnail: '/img/imgres-5.jpg'}];

            if (auctionData) {
                res.render('auction', {
                    loginRequired: true,
                    globalData: globalData,
                    auctionData: auctionData,
                    images: images,
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
    if (req.session.user) {
        newBid = req.body.newBid;
        Auction.findOne({ 'id' : req.body.auctionId }, function(err, auctionData) {
            if (auctionData) {
                if (newBid > auctionData.current_bid) {
                    auctionData.current_bid = newBid;
                    auctionData.save(function(err) {
                        if (err){
                            res.send({ status: 'error', message: err });
                        }
                        res.send({ status: 'success', message: '' });
                        io.sockets.in(req.body.auctionId).emit('updateAuctionData', req.body.newBid, req.session.user + ' placed a bid of ' + newBid);
                    });
                } else {
                    res.send({ status: 'error', message: req.session.user + ' placed a invalid bid of ' + newBid });
                }
            } else {
                res.send({ status: 'error', message: 'There was an issue placeing a bid of ' + newBid });
            }
        });
    } else {
        res.send({status: 'faled', message: 'User is not logged in'});
    }
});

function loadGlobalData(req, cb) {
    var data = {};
    if (req.session.user != undefined) {
        data.user = req.session.user;
    } else {
        data.user = '';
    }
    data.name = 'WebsiteName';
    data.server = req.headers.host;
    console.log(req.user);
    console.log(data);
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
