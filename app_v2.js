
//declaring global variables
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieSession = require('cookie-session')
const bcrypt = require('bcrypt'); 

//set up middlewares
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['superKey', 'superKey'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.set('view engine', 'ejs');

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//declaring databases
var urlDatabase = {
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
}

//create short URL  
function generateRandomString() {
    return Math.random().toString(36).substr(2, 6);
}

//find e-mail in database
function checkEmailExists(email){
  for (let i in users){
    if (users[i].email === email){
      return i, true;
    }
  }
  return false;
}

//find user by e-mail
function getUserByEmail(email){
  for (let i in users){
    if(users[i].email === email){
      return users[i];
    } 
  }
  return null;
}

//filter urls by user
function urlsForUser(id){
  var userDb = {};
  for (var url_id in urlDatabase) {
    url = urlDatabase[url_id];
    if( url.userID === id ) {
      userDb[url_id] = urlDatabase[url_id].longURL; 
    }
  }
  return userDb;
}
//check if e-mail and password are filled out
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
      user: users[req.session.user_id]
      };
      if(req.session.user_id){
        res.redirect(302, '/urls', templateVars);
      }
    res.redirect(302,'/login');
});

//log in and set cookies
  app.get('/login',(req, res) => {
    
    res.render('pages/login', {
      urlDatabase:urlDatabase,
      user: users[req.session.user_id]
    });
  });
  
  app.post('/login', (req, res) => {
    var userLog = {};
    if (checkAllFilledOut(req.body.email, req.body.password)) {
      if(checkEmailExists(req.body.email)) {
        userLog = getUserByEmail(req.body.email);
        console.log(userLog);
        console.log(req.body.password);
        if (bcrypt.compareSync(req.body.password, userLog.password)) {
          console.log("I am in!");
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
    console.log("everything is perfect, baby");
    console.log(userLog.id);
  });

  //log out and clear cookies
    app.post('/logout', (req, res) => {
      req.session = null;
      res.redirect(302, '/urls')
    });

//show all urls
app.get("/urls", (req, res) => {
  res.render('pages/urls_index', {
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id)
  });
});

  
  //show single URL
  app.get("/urls/:id", (req, res) => {
    var tempShortURL = req.params.id;
    var longURL = urlDatabase[tempShortURL].longURL;
    
    let templateVars = { shortURL: tempShortURL, 
      longURL: longURL, 
      user: users[req.session.user_id] };
      
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
      urlDatabase[req.params.shortURL] = {
        shortURL: req.params.shortURL,
        longURL: req.body.updateURL,
        userID: req.session.user_id
      }; 
      res.redirect(302, '/urls');
    });
    
    //redirect to website
    app.get("/u/:shortURL", (req, res) => {
      let longURL = urlDatabase[req.params.shortURL];
      res.redirect(longURL);
    });
    
    //create new URL
    app.get("/urls_new", (req, res) => {
      if(req.session.user_id){
        res.render("pages/urls_new", {
          user: users[req.session.user_id]
        });
      } else {
        res.redirect(302, '/login');
      }
    });
    
    //creating new URL
    app.post("/urls", (req, res) => {
      var newShortURL = generateRandomString();
      urlDatabase[newShortURL] = {
        shortURL: newShortURL,
        longURL: req.body.longURL,
        userID: req.session.user_id
      } 
        res.render("pages/urls_index", {
            user: users[req.session.user_id],
            urlDatabase:urlDatabase,
            urls: urlsForUser(req.session.user_id)

        });
      res.redirect(302, 'urls/' + shortURL);
    });

    //register new user
    app.get("/register", (req, res) => {
      res.render('pages/register', { 
        user: users[req.session.user_id]
 });
});

app.post('/register', (req, res) => {
  var userId = generateRandomString();
  var message = 'all good';
  var hashedPassword = bcrypt.hashSync(req.body.password, 10);
  
  if (checkAllFilledOut(req.body.email, req.body.password)) {
    if (checkEmailExists(req.body.email)){
      res.statusCode = 400;
      res.send("This e-mail is already registered. Did you forget your password?")
    };
    users[userId] = {
      id: userId,
      email: req.body.email,
      password: hashedPassword
    }
    req.session.user_id = userId;
  } else{
      res.statusCode = 400;
      res.send("You forgot to insert something. Please, go back.");
    }
        res.render('pages/urls_index', {
          user: users[req.session.user_id],
          urlDatabase:urlDatabase,
          urls: urlsForUser(req.session.user_id)
});
});