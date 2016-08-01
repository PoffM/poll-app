var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', {
		title: 'Poll App'
	});
});

//ajax login
router.post('/login', function(req,res,next) {
	passport.authenticate('local', function(err, user, info) {
		if (err) { return next(err); }
		if (!user) { return res.status(401).send({status:401,message:"Invalid username or password."}); }
		req.logIn(user, function(err) {
			if (err) { return next(err); }
			return res.send({status: 200, message: "Logged in!"});
		});
	})(req, res, next);
});

//ajax logout
router.get('/logout', function(req,res) {
	req.logout();
	res.send({status: 200, message: "Logged out."});
});

module.exports = router;
