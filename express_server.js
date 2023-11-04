const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const { restart } = require("nodemon");
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
function fetchUser(database, userEmail) {
  for (user in database) {
    if (database[user].email === userEmail) {
      return database[user];
    }
  }
};

const userDatabase = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "violet"
  }
};
app.use(express.urlencoded({ extended: true }));


app.get("/urls", (req, res) => {
let user_id = req.cookies["user_id"];
let user = userDatabase[user_id]; 
let templateVars = { urls: urlDatabase, user: user };
res.render("urls_index", templateVars);
});



app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.status(403).send("Sorry! Only registered users can shorten URLs.")
  }
  console.log(req.body); // Log the POST request body to the console
  newShortID = generateRandomString(6);
  newLongURL = req.body.longURL;
  urlDatabase[newShortID] = newLongURL;
  res.redirect(`/urls/${newShortID}`)
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
  console.log(req.cookies["user_id"]);
});


app.get("/urls/new", (req, res) => {
let user_id = req.cookies["user_id"];
let user = userDatabase[user_id]; 
let templateVars = { urls: urlDatabase, user: user };
if (!req.cookies["user_id"]) {
 return res.redirect("/login");
}
  res.render("urls_new", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]
  if (!longURL) {
    return res.status(404).send("Sorry! This URL does not exist in our Database.")
  }
  return res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  let user_id = req.cookies["user_id"];
  let user = userDatabase[user_id]; 
  let templateVars = { urls: urlDatabase, id: req.params.id, longURL: urlDatabase[req.params.id], user: user};
  res.render("urls_show", templateVars);
})

app.post("/urls/:id/delete", function(req, res) {
  const id = req.params.id;
  delete urlDatabase[id];
  return res.redirect("/urls");
});
app.post("/urls/:id", function(req, res) {
  const longURL = req.body.newLongURL;
  const shortURL = req.params.id;
  urlDatabase[shortURL] = longURL
  return res.redirect('/urls');
});

app.post("/login", function(req, res){
  let email = req.body.email;
  let password = req.body.password;
  let loggedInUser = fetchUser(userDatabase, email);
  if (loggedInUser) {
    if (password === loggedInUser.password) {
      res.cookie("user_id", loggedInUser.id);
      return res.redirect("/urls");
      return;
    } else {
      res.status(403).send("Error. Password does not match records.");
      return;
    }
    
  } else {
    return res.status(403).send("Error. Email has not been registered")
  }
  
})

app.post("/logout", function(req, res){
  res.clearCookie("user_id");
  return res.redirect('/urls');
});

app.get("/register", function(req, res){
  if (req.cookies["user_id"]) {
    return res.redirect('/urls');
  }
  res.render("urls_registration.ejs")
});

app.post("/register", function(req, res){
  newUserID = generateRandomString(6);
  password = req.body.password;
  email = req.body.email;
  if (password === "" || email === "") {
    return res.status(400).send("Error. Invalid field detected.");
  }
  if (fetchUser(userDatabase, email)) {
    return res.status(400).send("Error. Email is already registered.")
  }
  userDatabase[newUserID] = {
    id: newUserID,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie("user_id", newUserID);
  return res.redirect("/urls");
})

app.get("/login", function(req, res) {
  if (req.cookies["user_id"]) {
    return res.redirect('/urls');
  }
  res.render("urls_login.ejs");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});