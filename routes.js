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
            title: 'My Chat',
            chat_room: req.params[0]
        });
    });
});

app.get('/*', ensureAuthenticated, function(req, res) {
    loadGlobalData(req, function (globalData) {
        res.render('chat', {
            globalData: globalData,
            title: 'My Chat',
            username: req.user.username,
            chat_room: req.params[0]
        });
    });
});

app.post('/login',
    passport.authenticate('local', { 
        failureRedirect: '/login', 
        failureFlash: true 
    }), function(req, res) {
        var redirectUrl = getUrlVars(req.headers.referer)["redirect"];
        console.log(redirectUrl);
        res.redirect(redirectUrl != undefined ? redirectUrl : '/public');
    }
);

function loadGlobalData(req, cb) {
    var data = {};
    if (req.user && req.user.username) {
        data.user = req.user.username;
    } else {
        data.user = '';
    }
    data.server = req.headers.host;
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
    if (req.isAuthenticated()) { return next(); }
    console.log(req.url);
    res.redirect('/login?redirect='+req.url);
}
