var express = require("express");
var bodyParser = require("body-parser");
var request = require('request');
var app = express();
var db = require('./models/');
var passport = require("passport");
var session = require("cookie-session");

var movies =[];
//dont know why we need this (ask mike)
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
  console.log('USER: ',req.user.email);
  var movie = req.body.movieTitle;
  var id = req.user.id;
  db.movies.findAll({where: {userId: id}})
            .then(function(m) {
              console.log(m);
              console.log("LENGTH", m.length);
              res.render("sites/profile", {email: req.user.email, moviesList: m});
            });
  //res.render(movieList)
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

//this is creating a new user in my database 
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
  db.movies.create({title: req.body.movieTitle, imdbID: req.body.movie_imdbId})
  .then(function(movie) {
  	res.redirect('sites/profile');
  })

});


//allows the user to log out 
app.get("/logout", function (req, res) {
  // log out
  req.logout();
  res.redirect("/");
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

app.post('/movies/add', function (req,res) {
  //console.log(req.body);
  var movie = req.body;
  //console.log('\n\n\n\n\n\n\n\n\n\n\n\nUSER ID', req.user.id)
  // { movieTitle: 'Batman Begins', movie_imdbId: 'tt0372784' }
    //   title: DataTypes.STRING,
    // imdbID: DataTypes.STRING,
    // userID: DataTypes.INTEGER
  db.movies.create({title: movie.movieTitle,
                    imdbID: movie.movie_imdbId,
                    userId: req.user.id})
                  .then(function(movie) {
                    res.redirect('/profile');
                    //res.redirect('/profile');
                  });
  //res.redirect('/success');
});

app.get('/success', function(req,res) {
  res.send('movie added');
});

app.listen(3000, function () {
 
})





