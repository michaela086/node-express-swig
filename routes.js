app.get('/', function(req, res) {
    loadGlobalData(req, function (globalData) {
        res.render('index', {
            globalData: globalData,
            title: 'Home'
        });
    });
});

app.get('/account', ensureAuthenticated, function(req, res) {
    loadGlobalData(req, function (globalData) {
        res.render('account', {
            globalData: globalData,
            title: 'My Account'
        });
    });
});

app.get('/admin', ensureAdminAuthenticated, function(req, res) {
    loadGlobalData(req, function (globalData) {
        res.render('admin', {
            globalData: globalData,
            title: 'Admin',
            message: req.flash('error')
        });
    });
});

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

app.post('/login',
    passport.authenticate('local', { 
        failureRedirect: '/login', 
        failureFlash: true 
    }), function(req, res) {
        var redirectUrl = getUrlVars(req.headers.referer)["redirect"];
        res.redirect(redirectUrl !== undefined ? redirectUrl : '/');
    }
);

function loadGlobalData(req, cb) {
    var data = {};
    if (req.user && req.user.username) {
        data.user = req.user.username;
    } else {
        data.user = '';
    }
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
    res.redirect('/login?redirect='+req.route.path);
}

function ensureAdminAuthenticated(req, res, next) {
    var isAdmin = req.user && req.user.admin;
    if (req.isAuthenticated() && isAdmin) { return next(); }
    res.redirect('/login?redirect='+req.route.path);
}
