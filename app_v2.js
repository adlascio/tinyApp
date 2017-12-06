
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  };

function generateRandomString() {
    return Math.random().toString(36).substr(2, 6);
}

app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    res.render('pages/index');
});

app.get("/urls", (req, res) => {
    
    res.render('pages/urls_index', {
        urlDatabase: urlDatabase
    }
    );
  });

app.get("/urls/:id", (req, res) => {
    var tempShortURL = req.params.id;
    var longURL = urlDatabase[tempShortURL];
    
    let templateVars = { shortURL: tempShortURL, longURL: longURL };

    res.render("pages/urls_show", templateVars);
   
});

app.get("/about", (req, res) => {
    res.render('pages/about');
});

app.get("/urls_new", (req, res) => {
    res.render("pages/urls_new");
  });
  
  app.post("/urls", (req, res) => {
    console.log(req.body);  // debug statement to see POST parameters
    var shortURL = generateRandomString();
    urlDatabase[shortURL] = req.body.longURL;
    res.redirect('urls/' + shortURL);
  });

  app.post('/urls/:shortURL/delete', (req,res) => {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  });

  app.post('/urls/:shortURL/update', (req,res) => {
    console.log("req params:", req.params);
    console.log("req.body:", req.body);
    urlDatabase[req.params.shortURL] = req.body.updateURL; 
    res.redirect('/urls');
  });  

  app.get("/u/:shortURL", (req, res) => {
    let longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
  });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});