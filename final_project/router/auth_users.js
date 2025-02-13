const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  for (let i = 0; i < users.length; i++) {
    if (users[i].username === username) {
        return true;
    }
  }
  return false;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  for (let i = 0; i < users.length; i++) {
    if (users[i].username === username && users[i].password === password) {
        return true;
    }
  }
  return false;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
    const password = req.body.password;

    if (!username ||!password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (authenticatedUser(username, password)) {
        // Generate JWT (replace 'your_secret_key' with an actual secret)
        let accessToken = jwt.sign({
            data: password
        }, 'your_secret_key', { expiresIn: 60 * 60 });

        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(401).json({ message: "Invalid username or password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization.username;

  let validBook = books[isbn];
  if (validBook) {
    const reviews = validBook.reviews;
    const existingReview = reviews[username];
    reviews[username] = review;
    if (existingReview) {
      return res.status(200).send("Review successfully updated");
    } else {
      return res.status(200).send("Review successfully added");
    }
  } else {
    return res.status(404).json({ message: "Provided book does not exist" });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  let validBook = books[isbn];

  if (validBook) {
    const existingReview = validBook.reviews[username];
    if (existingReview) {
      delete validBook.reviews[username];
    }
    return res
      .status(200)
      .send(
        `Review from User, ${username} removed successfully from Book (ISBN: ${isbn}).`
      );
  } else {
    return res.status(404).json({ message: "Provided book does not exist" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
