const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
    const password = req.body.password;

    // Check if username and password are provided
    if (!username ||!password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if the username already exists
    if (isValid(username)) {
        return res.status(409).json({ message: "Username already exists" });
    }

    // Add the new user to the users array (implementation for this in auth_users.js)
    users.push({ username, password });

    return res.status(201).json({ message: "User registered successfully" });
});


function retrieveBooks() {
    return new Promise((resolve, reject) => {
      resolve(books);
    });
  }

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    retrieveBooks().then(
    (books) => res.status(200).send(JSON.stringify(books, null, 4)),
    (error) =>
      res
        .status(404)
        .send("An error has occured trying to retrieve all the books")
  );
});


function retrieveBookByISBN(isbn) {
    let book = books[isbn];
    return new Promise((resolve, reject) => {
      if (book) {
        resolve(book);
      } else {
        reject(new Error("The provided book does not exist"));
      }
    });
  } 
// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    retrieveBookByISBN(isbn).then(
      (book) => res.status(200).send(JSON.stringify(book, null, 4)),
      (err) => res.status(404).send(err.message)
    );
 });
  

 function retrieveBookByAuthor(author) {
    let validBooks = [];
    return new Promise((resolve, reject) => {
      for (let bookISBN in books) {
        const bookAuthor = books[bookISBN].author;
        if (bookAuthor === author) {
          validBooks.push(books[bookISBN]);
        }
      }
      if (validBooks.length > 0) {
        resolve(validBooks);
      } else {
        reject(new Error("The provided author does not exist"));
      }
    });
  }
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    retrieveBookByAuthor(author).then(
      (books) => res.status(200).send(JSON.stringify(books, null, 4)),
      (err) => res.status(404).send(err.message)
    );
});


function retrieveBookDetailsByTitle(title) {
    let validBooks = [];
    return new Promise((resolve, reject) => {
      for (let bookISBN in books) {
        const bookTitle = books[bookISBN].title;
        if (bookTitle === title) {
          validBooks.push(books[bookISBN]);
        }
      }
      if (validBooks.length > 0) {
        resolve(validBooks);
      } else {
        reject(new Error("The provided book title does not exist"));
      }
    });
  }

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    retrieveBookDetailsByTitle(title).then(
      (book) => res.status(200).send(JSON.stringify(book, null, 4)),
      (err) => res.status(404).send(err.message)
    );
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn] !== null) {
    res.send(JSON.stringify(books[isbn].reviews, null, 4));
  } else {
    return res.status(404).json({ message: "Provided book does not exist" });
  }
});

module.exports.general = public_users;
