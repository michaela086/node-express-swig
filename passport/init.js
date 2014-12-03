var login = require('./login');
var signup = require('./signup');

module.exports = function(passport){

    passport.serializeUser(function(user, done) {
      done(null, user);
    });

    passport.deserializeUser(function(obj, done) {
      done(null, obj);
    });

    login(passport);
    signup(passport);

}