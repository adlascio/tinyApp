
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

function checkEmailExists(email){
  for (let i in users){
    if (users[i].email === email){
      return i, true;
    }
  }
  return false;
}

function getUserByEmail(email){
  for (let i in users){
    if(users[i].email === email){
      return users[i];
    } 
  }
  return null;
}

function checkAllFilledOut(email, password){
  if(email === '' || password === ''){
    if(email === ''){
      //message = "You forgot to insert your e-mail. Please, go back.";
      return false;
    }
    //message = "You forgot to insert your password. Please, go back.";
    return false;
  }
  return true;
}

//homepage
app.get('/', function(req, res) {
    let templateVars = {
      user: users[req.cookies.user_id]
      };
    res.render('pages/index', templateVars);
});

//log in and set cookies
  app.get('/login',(req, res) => {
    
    res.render('pages/login', {
      urlDatabase:urlDatabase,
      user: users[req.cookies.user_id]
    });
  });
  
  app.post('/login', (req, res) => {
    userLog = {};
    if (checkAllFilledOut(req.body.email, req.body.password)) {
      if(checkEmailExists(req.body.email)) {
        userLog = getUserByEmail(req.body.email);
        console.log(userLog);
        if (userLog.password === req.body.password) {

          console.log("I am in!");
        }
        else{
          res.statusCode = 403;
          res.send("Invalid e-mail and/or password. Please, go back.");
        }
      } else {
        res.statusCode = 403;
        res.send("Invalid e-mail and/or password. Please, go back.");
      }
     } else {
      res.statusCode = 400;
      res.send("You forgot to insert something. Please, go back.");
    }

    res.cookie('user_id', userLog.id);
    res.redirect(302, '/urls')
  });

  //log out and clear cookies
    app.post('/logout', (req, res) => {
      res.clearCookie('user_id');
      res.redirect(302, '/urls')
    });

//show all urls
app.get("/urls", (req, res) => {

    res.render('pages/urls_index', {
        urlDatabase:urlDatabase,
        user: users[req.cookies.user_id]
    });
  });
  
  
  //show single URL
  app.get("/urls/:id", (req, res) => {
    var tempShortURL = req.params.id;
    var longURL = urlDatabase[tempShortURL];
    
    let templateVars = { shortURL: tempShortURL, 
      longURL: longURL, 
      user: users[req.cookies.user_id] };
      
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
        user: users[req.cookies.user_id]
      });
    });
    
    //creating new URL
    app.post("/urls", (req, res) => {
      var shortURL = generateRandomString();
      urlDatabase[shortURL] = req.body.longURL;
        res.render("pages/urls_index", {
            user: users[req.cookies.user_id],
            urlDatabase:urlDatabase
        });
      res.redirect(302, 'urls/' + shortURL);
    });

    //register new user
    app.get("/register", (req, res) => {
      res.render('pages/register', { 
        user: users[req.cookies.user_id]
 });
});

app.post('/register', (req, res) => {
  var userId = generateRandomString();
  var message = 'all good';
  
  if (checkAllFilledOut(req.body.email, req.body.password)) {
    if (checkEmailExists(req.body.email)){
      res.statusCode = 400;
      res.send("This e-mail is already registered. Did you forget your password?")
    };
    users[userId] = {
      id: userId,
      email: req.body.email,
      password: req.body.password
    }
    res.cookie('user_id', userId);
  } else{
      res.statusCode = 400;
      res.send("You forgot to insert something. Please, go back.");
    }
        res.render('pages/urls_index', {
          user: users[req.cookies.user_id],
          urlDatabase:urlDatabase
});
});