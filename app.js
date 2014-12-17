var express = require("express");
 var bodyParser = require("body-parser");
 var request = require('request');
 var app = express();
 var db = require('./models/');
var passport = require("passport");
var session = require("cookie-session");

var movies =[];

app.use(session( {
  secret: 'thisismysecretkey',
  name: 'chocolate chip',
  // this is in milliseconds
  maxage: 3600000
  })
);

// get passport started
app.use(passport.initialize());
app.use(passport.session());

/*
SERIALizING
Turns relevant user data into a string to be 
  stored as a cookie
*/
passport.serializeUser(function(user, done){
  console.log("SERIALIZED JUST RAN!");

  done(null, user.id);
});

/*
DeSERIALizing
Taking a string and turns into an object
  using the relevant data stored in the session
*/
passport.deserializeUser(function(id, done){
  console.log("DESERIALIZED JUST RAN!");
  db.users.find({
      where: {
        id: id
      }
    })
    .then(function(user){
      done(null, user);
    },
    function(err) {
      done(err, null);
    });
});

//app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

// our root route
app.get("/", function (req, res) {
  res.render("sites/home");
});

// my profile page 
app.get("/profile", function (req, res) {
  var movie = req.body.movieTitle;

  res.render("sites/profile");
});

app.get("/sign_up", function (req, res){
  res.render("sites/sign_up")

})


//my search page, where the results of my seach will show up 
app.get("/search", function (req, res) {
  //setting the title to req.query.movieTitle; is still fussy 
	var title = req.query.movieTitle;
	if (typeof title === 'undefined') {
  //I dont understand what your rendering hear 
		res.render('sites/search', {movieList: []});
	} else  {
	//console.log(title);
		request('http://www.omdbapi.com/?s=' + title, function (err, response, body) {
			console.log(body);
    	var results = JSON.parse(body);
    	console.log(results);
    	var searchResults = results.Search;
			res.render("sites/search", {movieList: searchResults});
		});
	}
});


app.post("/users", function (req,res){
  console.log(req.body);
  db.users.createSecure(req.body.user.email, req.body.user.password,
    function(err, user, msg) { res.redirect('/sign_up'); },
    function(err, user, msg) {
      res.redirect('/');
    })
});


// idk what im going to post hear yet 
app.post("/profile", function (req, res) {

  //var movie = req.body.movieTitle;
  console.log(req.body);
  db.movies.create({title: req.body.movieTitle, imdbID: req.body.movie_imdbId}).then(function(movie) {
  	res.redirect('sites/profile');
  })

});

// app.post('/login', function(req, res) {
//   console.log(req.body);

//   db.users.authenticate(req.body.user.email, req.body.user.password, function(err, msg){

//   })
//   //Check authentication in database
//   res.redirect('/success');
// });

app.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/login'
}));

app.get('/success', function(req,res) {
  res.send('logged in');
});

app.listen(3000, function () {
 
})





