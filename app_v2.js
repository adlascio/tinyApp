
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser') 

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// app.use((req, res, next) => {
//     // res.username = res.cookies['username'] || null;
//     res.username = "a";
//     next();
// });

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  };

function generateRandomString() {
    return Math.random().toString(36).substr(2, 6);
}

app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    let templateVars = {
        username: req.cookies['username']
      };
    res.render('pages/index', templateVars);
});

app.get("/urls", (req, res) => {
    console.log(req.cookies);

    res.render('pages/urls_index', {
        urlDatabase:urlDatabase,
        username: req.cookies['username']
    });
  });

app.get("/urls/:id", (req, res) => {
    var tempShortURL = req.params.id;
    var longURL = urlDatabase[tempShortURL];
    
    let templateVars = { shortURL: tempShortURL, 
        longURL: longURL, 
        username: req.cookies['username'] };

    res.render("pages/urls_show", templateVars);
   
});

app.get("/urls_new", (req, res) => {
    res.render("pages/urls_new", {
        username: req.cookies["username"]
    });
  });
  
  app.post("/urls", (req, res) => {
      res.render("pages/urls_index", {
          username: req.cookies['username']
      });
    var shortURL = generateRandomString();
    urlDatabase[shortURL] = req.body.longURL;
    res.redirect(302, 'urls/' + shortURL);
  });

  app.post('/urls/:shortURL/delete', (req,res) => {
    delete urlDatabase[req.params.shortURL];
    res.redirect(302, '/urls');
  });

  app.post('/urls/:shortURL/update', (req,res) => {
    console.log("req params:", req.params);
    console.log("req.body:", req.body);
    urlDatabase[req.params.shortURL] = req.body.updateURL; 
    res.redirect(302, '/urls');
  });  

  app.get("/u/:shortURL", (req, res) => {
    let longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
  });

  app.post('/login', (req, res) => {
    let username = req.body.username;
    console.log(username);
    res.cookie('username', username);
    res.redirect(302, '/urls')
  });

  app.post('/logout', (req, res) => {
    res.clearCookie('username');
    res.redirect(302, '/urls')
  });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});