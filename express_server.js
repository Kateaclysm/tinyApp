const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')
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

app.use(express.urlencoded({ extended: true }));


app.get("/urls", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});



app.post("/urls", (req, res) => {
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
});


app.get("/urls/new", (req, res) => {
  const { username } = req.cookies;
  const templateVars = { username };
  res.render("urls_new", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
})

app.post("/urls/:id/delete", function(req, res) {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});
app.post("/urls/:id", function(req, res) {
  const longURL = req.body.newLongURL;
  const shortURL = req.params.id;
  urlDatabase[shortURL] = longURL
  res.redirect('/urls');
});

app.post("/login", function(req, res){
  res.cookie("username",req.body.username);
  res.redirect("/urls");
})

app.post("/logout", function(req, res){
  res.clearCookie("username");
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});