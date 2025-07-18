const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    if (!isValid(username)) {
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: `User ${username} Registered Successfully` });
    } else {
      return res
        .status(400)
        .json({ message: `User ${username} Already registered` });
    }
  } else {
    return res
      .status(404)
      .json({ message: "Must provide username and password" });
  }
});

function getBooks() {
  return new Promise((resolve, reject) => {
    resolve(books);
  });
}

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  try {
    const bks = await getBooks();
    res.send(JSON.stringify(bks));
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

function getByISBN(isbn) {
  return new Promise((resolve, reject) => {
    let isbnNum = parseInt(isbn);
    if (books[isbnNum]) {
      resolve(books[isbnNum]);
    } else {
      reject({ status: 404, message: `ISBN ${isbn} not found` });
    }
  });
}

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  getByISBN(isbn)
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      res
        .status(error.status || 500)
        .json({ message: error.message || "Internal server error" });
    });
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;

  getBooks()
    .then((bookEntries) => {
      const books = Object.values(bookEntries);
      const filteredBooks = books.filter((book) => book.author === author);
      res.send(filteredBooks);
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: "Error retrieving books by author", error });
    });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  getBooks()
    .then((bookEntries) => {
      const books = Object.values(bookEntries);
      const filteredBooks = books.filter((book) => book.title === title);
      res.send(filteredBooks);
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: "Error retrieving books by title", error });
    });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  getByISBN(req.params.isbn).then(
    (result) => res.send(result.reviews),
    (error) => res.status(error.status).json({ message: error.message })
  );
});

module.exports.general = public_users;
