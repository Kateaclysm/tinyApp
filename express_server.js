const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const { restart } = require("nodemon");
const res = require("express/lib/response");
const e = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session')
const fetchUser = require('./helpers.js')
app.set("view engine", "ejs");


app.use(cookieSession({
  name: 'user_id',
  keys: ["123"],

}));

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "userRandomID"
  },
  "sgq3y6": {
    longURL: "http://www.tumblr.com",
    userID: "K5n2Qd"
  }
};

function generateRandomString(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789"
  const newID = Array.from(characters);
  let min = Math.ceil(0);
  let max = Math.floor(newID.length);
  let shortenedID = [];
  for (let i = 0; i < length; i++) {
    let value = Math.floor(Math.random() * ( max - min +1) + min);
    shortenedID.push(characters[value]);
  }
  shortenedID = shortenedID.join('');
  return shortenedID;
};

function detectIfOwned(userId, linkID) {
  let result = false;
  if (urlDatabase[linkID].userID === userId) {
    result = true;
  }
  return result;
};

const userDatabase = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("violet", 10)
  }
};
app.use(express.urlencoded({ extended: true }));


app.get("/urls", (req, res) => {
  let user_id = req.session.user_id;
  console.log(user_id);
  if (userDatabase[user_id]) { // If the cookie value exists, render the homepage.
    let user = userDatabase[user_id].email;
    let templateVars = { urls: urlDatabase, user: user, user_id: user_id};
    return res.render("urls_index", templateVars);
  } else {
    return res.status(403).send("Sorry, you must be logged in to view your shortened URLs. Please visit /Login, or /Register to sign in or create an account.");
  };

});



app.post("/urls", (req, res) => {
  let userCookie = req.session.user_id;
  if (!userCookie) {
    return res.status(403).send("Sorry! Only registered users can shorten URLs.")
  }
  newShortID = generateRandomString(6);
  newLongURL = req.body.longURL;
  urlDatabase[newShortID] = newShortID;
  urlDatabase[newShortID] = {
    longURL: newLongURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${newShortID}`)
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls/new", (req, res) => {
let user_id = req.session.user_id;
let user = userDatabase[`${user_id}`].email;
let templateVars = { urls: urlDatabase, user: user };
if (!req.session.user_id) {
 return res.redirect("/login");
}
  return res.render("urls_new", templateVars);
});

app.get("/u/:id", (req, res) => {
  let id = req.params.id;
  for (urls in urlDatabase) {
    if (id === urlDatabase[urls].id) {
      const longURL = urlDatabase[id].longURL;
      return res.redirect(longURL);
    } else {
      return res.status(404).send("Sorry! This URL does not exist in our Database.")
    }
  }
});

app.get("/urls/:id", (req, res) => {
let user_id = req.session.user_id;
let id = req.params.id;
  if (user_id) {
    if (user_id === urlDatabase[id].userID) {
      let user = userDatabase[user_id].email;
      let templateVars = { urls: urlDatabase, id: id, user: user, longURL: urlDatabase[id].longURL};
      return res.render("urls_show", templateVars);
      } else {
        return res.status(403).send("Sorry! URLs cannot be accessed unless you are logged into the account who created it.");
    }
  } else {
    return res.status(403).send("Sorry! You have to be logged in to do that!");
  }
});

app.post("/urls/:id/delete", function(req, res) {
  let userId = req.session.user_id;
  let urlId = req.params.id;
  if (detectIfOwned(userId, urlId) === true) {
    delete urlDatabase[urlId];
    return res.redirect("/urls");
  } else if (detectIfOwned(userId, urlId) === false) {
    return res.status(403).send("This url doesnt exist.");
  } else if (userId) {
    res.status(403).send("Sorry! You can only delete URLs that you own.");
  } else {
    res.status(403).send("Sorry! You have to be logged in to do this!");
  }
});

app.post("/urls/:id", function(req, res) {
  const longURL = req.body.newLongURL;
  const shortURL = req.params.id;
  const user_id = req.session.user_id;
  if (user_id) {
    urlDatabase[shortURL] = {
    longURL: longURL,
    userID: user_id
    };
    return res.redirect('/urls');
  } else {
    return res.status(403).send("Sorry! You have to be logged in in order to register a new url.")
  }
});
app.get("/login", function(req, res) {
  let user_id = req.session.user_id;
  if (userDatabase[user_id]) {
    return res.redirect('/urls');
  }
  res.render("urls_login.ejs");
});

app.post("/login", function(req, res){
  let email = req.body.email;
  let loggedInUser = fetchUser(userDatabase, email);
  let password = req.body.password;
  let hashedPassword = bcrypt.hashSync(password, 10);
  if (loggedInUser) {
    if (bcrypt.compareSync(req.body.password, loggedInUser.password)) {
      req.session.user_id = loggedInUser.id;
      return res.redirect("/urls");
    } else {
      console.log(loggedInUser.password);
      res.status(403).send("Error. Password does not match records.");
      return;
    }
    
  } else {
    return res.status(403).send("Error. Email has not been registered")
  }
  
})

app.post("/logout", function(req, res){
  res.clearCookie("user_id");
  return res.redirect('/login');
});

app.get("/register", function(req, res){
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  res.render("urls_registration.ejs")
});

app.post("/register", function(req, res){
  const ID = generateRandomString(6);
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const email = req.body.email;
  if (password === "" || email === "") {
    return res.status(400).send("Error. Invalid field detected.");
  }
  if (fetchUser(userDatabase, email)) {
    return res.status(400).send("Error. Email is already registered.")
  }
  userDatabase[ID] = {
    id: ID,
    email: req.body.email,
    password: hashedPassword
  };
  req.session.user_id = ID;
  console.log(req.session.user_id);
  return res.redirect("/urls");
})



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});