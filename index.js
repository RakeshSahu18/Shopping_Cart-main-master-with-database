const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fs = require("fs");

// new addition ----------------------------------
var mongoose = require("mongoose");
var User = require("./userModel");

// connect with mongodb database
mongoose
  .connect(
    "mongodb+srv://rakeshsahu888444:9693@cluster0.vte05i5.mongodb.net/?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Database connected"))
  .catch((err) => console.log("Error: ", err));
// -----------------------------------------------

const app = express();
app.use(express.static(__dirname + "/public"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// Function to check if a user exists in the data file
function userExists(email, password) {
  const data = fs.readFileSync("users.txt", "utf8");
  const users = data.split("\n");
  for (const user of users) {
    const [storedEmail, storedPassword] = user.split(":");
    if (storedEmail === email && storedPassword === password) {
      return true;
    }
  }
  return false;
}

app.get("/login", (req, res, next) => {
  if (userExists(req.cookies.email, req.cookies.password)) {
    res.redirect("/");
  }
  res.sendFile(path.join(__dirname + "/pages/login.html"));
});

app.get("/signup", (req, res, next) => {
  console.log(userExists(req.cookies.email));
  if (userExists(req.cookies.email, req.cookies.password)) {
    res.redirect("/login");
  }
  res.sendFile(path.join(__dirname + "/pages/SignUp.html"));
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  // new addition ----------------------------------
  var result = await User.findOne({ Email: email }).exec();
  if (result !== null) {
    if (result.Password == password) {
      res.cookie("email", email);
      res.cookie("password", password);
      res.redirect("/");
    } else {
      res.status(401).send("Authentication failed");
    }
  } else {
    res.status(401).send("Authentication failed");
  }
  // -----------------------------------------------

  // remove the below content-----------------------
  //if (userExists(email, password)) {
  //  // User is authenticated
  //  res.cookie("email", email);
  //  res.cookie("password", password);
  //  res.redirect("/");
  //} else {
  //  // Authentication failed
  //  res.status(401).send("Authentication failed");
  //}
  // -----------------------------------------------
});

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  // Check if the user already exists
  if (userExists(email, password)) {
    res.status(409).send("User already exists.");
  } else {
    // new addition ----------------------------------
    // Add data to database
    var result = await User.create({
      Email: email,
      Password: password,
    }).catch((err) => {
      console.error(err);
    });
    // -----------------------------------------------

    // Add the new user to the data file
    const data = `${email}:${password}\n`;
    fs.appendFileSync("users.txt", data);

    res.status(200).redirect("/login");
  }
});

app.use((req, res, next) => {
  const emailFromCookie = req.cookies.email;

  if (emailFromCookie) {
    // User is authenticated
    next();
  } else {
    // User is not authenticated, redirect to login
    res.redirect("/login");
  }
});

app.get("/", (req, res, next) => {
  res.sendFile(path.join(__dirname + "/pages/index.html"));
});

app.get("/cart", (req, res, next) => {
  res.sendFile(path.join(__dirname + "/pages/cart.html"));
});

app.get("/checkout", (req, res, next) => {
  res.sendFile(path.join(__dirname + "/pages/checkout.html"));
});

app.listen(3000, () => {
  console.log("The server is working on localhost:3000");
});
