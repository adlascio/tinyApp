
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser') 

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set('view engine', 'ejs');

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//declaring database
var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  };

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "arthur@example.com", 
    password: "12345"
    },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "bob@example.com", 
    password: "54321"
  }
}

//create short URL  
function generateRandomString() {
    return Math.random().toString(36).substr(2, 6);
}


//homepage
app.get('/', function(req, res) {
    let templateVars = {
        username: req.cookies['username']
      };
    res.render('pages/index', templateVars);
});

//log in and set cookies
  app.post('/login', (req, res) => {
    let username = req.body.username;
    console.log(username);
    res.cookie('username', username);
    res.redirect(302, '/urls')
  });

  //log out and clear cookies
    app.post('/logout', (req, res) => {
      res.clearCookie('username');
      res.redirect(302, '/urls')
    });

//show all urls
app.get("/urls", (req, res) => {
    console.log(req.cookies);

    res.render('pages/urls_index', {
        urlDatabase:urlDatabase,
        username: req.cookies['username']
    });
  });
  
  
  //show single URL
  app.get("/urls/:id", (req, res) => {
    var tempShortURL = req.params.id;
    var longURL = urlDatabase[tempShortURL];
    
    let templateVars = { shortURL: tempShortURL, 
      longURL: longURL, 
      username: req.cookies['username'] };
      
      res.render("pages/urls_show", templateVars);
      
    });
    
    //delete URL
    app.post('/urls/:shortURL/delete', (req,res) => {
      delete urlDatabase[req.params.shortURL];
      res.redirect(302, '/urls');
    });
    
    //update URL
    app.post('/urls/:shortURL/update', (req,res) => {
      console.log("req params:", req.params);
      console.log("req.body:", req.body);
      urlDatabase[req.params.shortURL] = req.body.updateURL; 
      res.redirect(302, '/urls');
    });
    
    //redirect to website
    app.get("/u/:shortURL", (req, res) => {
      let longURL = urlDatabase[req.params.shortURL];
      res.redirect(longURL);
    });
    
    //create new URL
    app.get("/urls_new", (req, res) => {
      res.render("pages/urls_new", {
        username: req.cookies["username"]
      });
    });
    
    //creating new URL
    app.post("/urls", (req, res) => {
      var shortURL = generateRandomString();
      urlDatabase[shortURL] = req.body.longURL;
        res.render("pages/urls_index", {
            username: req.cookies['username'],
            urlDatabase:urlDatabase
        });
      res.redirect(302, 'urls/' + shortURL);
    });

    //register new user
    app.get("/register", (req, res) => {
      res.render('pages/register', { 
        username: req.cookies["username"]
 });
});

app.post('/register', (req, res) => {
  var userId = generateRandomString();
  users[userId] = {
    id: userId,
    email: req.body.email,
    password: req.body.password
  };
  res.render('pages/index', {
    username: req.cookies["username"]
  });
});