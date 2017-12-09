//declaring global variables
const express = require("express");
const app = express();
// default port 8080
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
var cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

//set up middlewares
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['superKey', 'superKey'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000
    // 24 hours
}));
app.set('view engine', 'ejs');

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//declaring databases
const urlDatabase = {
  "b2xVn2": {
    shortURL: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    userID: "user2RandomID"
  },
  "9sm5xK": {
    shortURL: "9sm5xK",
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "arthur@example.com",
    password: bcrypt.hashSync("12345", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "bob@example.com",
    password: bcrypt.hashSync("54321", 10)
  }
};

//create short URL
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

//find e-mail in database
function checkEmailExists(email){
  for (let i in users) {
    if (users[i].email === email){
      return true;
    }
  }
  return false;
}

//find user by e-mail
function getUserByEmail(email){
  for (let i in users) {
    if (users[i].email === email) {
      return users[i];
    }
  }
  return null;
}

//filter urls by user
function urlsForUser(id){
  var userDb = {};
  for (var urlId in urlDatabase) {
    url = urlDatabase[urlId];
    if (url.userID === id) {
      userDb[urlId] = urlDatabase[urlId].longURL;
    }
  }
  return userDb;
}
//check if e-mail and password are filled out
function checkAllFilledOut(email, password ){
  if (email === '' || password === '') {
    if (email === '') {
      return false;
    }
    return false;
  }
  return true;
}

//homepage
app.get('/', function(req, res) {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

//load log in page
app.get('/login', (req, res) => {
  if (req.session.user_id) {
    res.redirect(302, '/urls');
  }
    
  res.render('pages/login', {
    urlDatabase: urlDatabase,
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id)
  });
});

//log in and make cookies
app.post('/login', (req, res) => {
  var userLog = {};
  if (checkAllFilledOut(req.body.email, req.body.password)) {
    if (checkEmailExists(req.body.email)) {
      userLog = getUserByEmail(req.body.email);
      if (bcrypt.compareSync(req.body.password, userLog.password)) {
        req.session.user_id = userLog.id;
        res.redirect(302, '/urls');
      } else {
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
});

  //log out and clear cookies
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect(302, '/urls');
});

//load and show all urls
app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    res.render('pages/urls_index', {
      user: users[req.session.user_id],
      urls: urlsForUser(req.session.user_id)
    });
  } else {
    res.send("Please, <a href='localhost:8080/login'>log in</a> first. Go to localhost:8080/login");
  }
});

//check if URL exists
function checkURL(url) {
  for (let i in urlDatabase) {
    if (urlDatabase[i].shortURL === url) {
      return true;
    }
  }
  return false;
}

//get and return user by url
function getUserByURL(url) {
  for (let i in urlDatabase) {
    if (urlDatabase[i].shortURL === url) {
      return urlDatabase[i];
    }
  }
  return null;
}

  //load single URL page
app.get("/urls/:id", (req, res) => {
  var shortURL = req.params.id;
  if (checkURL(shortURL)) {
    if (req.session.user_id) {
      if (getUserByURL(shortURL).userID === req.session.user_id) {
        var longURL = urlDatabase[shortURL].longURL;
        let templateVars = {
          shortURL: shortURL,
          longURL: longURL,
          user: users[req.session.user_id] };
        res.render("pages/urls_show", templateVars);
      } else {
        res.send("Sorry, you are not allowed to access this URL. Please, go back.");
      }
    } else {
      res.send("Please, <a href='localhost:8080/login'>log in</a> first. Go to localhost:8080/login");
    }
  } else {
    res.send("Sorry, invalid URL. Please, check if it is correct.");
  }
});
    
    //delete URL
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(302, '/urls');
});
    
    //update URL
app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = {
    shortURL: req.params.shortURL,
    longURL: req.body.updateURL,
    userID: req.session.user_id
  };
  res.redirect(302, '/urls');
});
    
    //redirect to website
app.get("/u/:shortURL", (req, res) => {
  if (checkURL(req.params.shortURL)) {
    let longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.send("Invalid URL. Please, check if it is correct.");
  }
});
    
    //load new URL page
app.get("/urls_new", (req, res) => {
  if (req.session.user_id) {
    res.render("pages/urls_new", {
      user: users[req.session.user_id]
    });
  } else {
    res.redirect(302, '/login');
  }
});
    
    //create new URL
app.post("/urls", (req, res) => {
  var newShortURL = generateRandomString();
  var newLongURL = '';
  if (req.body.longURL.substring(0, 3) === 'http') {
    newLongURL = req.body.longURL;
  } else {
    newLongURL = "http://" + req.body.longURL;
  }
  urlDatabase[newShortURL] = {
    shortURL: newShortURL,
    longURL: newLongURL,
    userID: req.session.user_id
  };
  res.redirect(302, 'urls/' + newShortURL);
});

    //load register page
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  res.render('pages/register', {
    user: users[req.session.user_id]
  });
});

//register new user
app.post('/register', (req, res) => {
  var userId = generateRandomString();
  var hashedPassword = bcrypt.hashSync(req.body.password, 10);
  
  if (checkAllFilledOut(req.body.email, req.body.password)) {
    if (checkEmailExists(req.body.email)) {
      res.statusCode = 400;
      res.send("This e-mail is already registered. Did you forget your password?");
    }
    users[userId] = {
      id: userId,
      email: req.body.email,
      password: hashedPassword
    };
    req.session.user_id = userId;
  } else {
    res.statusCode = 400;
    res.send("You forgot to insert something. Please, go back.");
  }
  res.render('pages/urls_index', {
    user: users[req.session.user_id],
    urlDatabase: urlDatabase,
    urls: urlsForUser(req.session.user_id)
  });
});