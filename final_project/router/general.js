const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  try {
    const { username, password } = req.body;

    // 检查是否提供了用户名和密码
    if (!username || !password) {
      return res.status(400).json({
        message: "Registration failed: Username and password are required",
        details: {
          username: username ? "provided" : "missing",
          password: password ? "provided" : "missing",
        },
      });
    }

    // 检查用户名是否已存在
    if (users.find((user) => user.username === username)) {
      return res.status(409).json({
        message: "Registration failed: Username already exists",
        username: username,
      });
    }

    // 创建新用户
    const newUser = {
      username: username,
      password: password,
    };
    users.push(newUser);

    return res.status(201).json({
      message: "User registered successfully",
      username: username,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  const getBooks = new Promise((resolve, reject) => {
    try {
      resolve(books);
    } catch (error) {
      reject(error);
    }
  });

  getBooks
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(500).json({ message: "Error occurred while fetching books list" });
    });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const getBookByISBN = new Promise((resolve, reject) => {
    try {
      const isbn = req.params.isbn;
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject(new Error("Book not found"));
      }
    } catch (error) {
      reject(error);
    }
  });

  getBookByISBN
    .then((book) => {
      res.status(200).json(book);
    })
    .catch((error) => {
      if (error.message === "Book not found") {
        res.status(404).json({ message: "Book not found for the given ISBN" });
      } else {
        res.status(500).json({ message: "Error occurred while fetching book details" });
      }
    });
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const getBooksByAuthor = new Promise((resolve, reject) => {
    try {
      const requestedAuthor = req.params.author;
      const booksByAuthor = Object.keys(books)
        .filter((isbn) => books[isbn].author.toLowerCase() === requestedAuthor.toLowerCase())
        .reduce((result, isbn) => {
          result[isbn] = books[isbn];
          return result;
        }, {});

      if (Object.keys(booksByAuthor).length > 0) {
        resolve(booksByAuthor);
      } else {
        reject(new Error("No books found for this author"));
      }
    } catch (error) {
      reject(error);
    }
  });

  getBooksByAuthor
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      if (error.message === "No books found for this author") {
        res.status(404).json({ message: "No books found for the given author" });
      } else {
        res.status(500).json({ message: "Error occurred while searching for books by author" });
      }
    });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const getBooksByTitle = new Promise((resolve, reject) => {
    try {
      const requestedTitle = req.params.title;
      const booksByTitle = Object.keys(books)
        .filter((isbn) => books[isbn].title.toLowerCase().includes(requestedTitle.toLowerCase()))
        .reduce((result, isbn) => {
          result[isbn] = books[isbn];
          return result;
        }, {});

      if (Object.keys(booksByTitle).length > 0) {
        resolve(booksByTitle);
      } else {
        reject(new Error("No books found with this title"));
      }
    } catch (error) {
      reject(error);
    }
  });

  getBooksByTitle
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      if (error.message === "No books found with this title") {
        res.status(404).json({ message: "No books found for the given title" });
      } else {
        res.status(500).json({ message: "Error occurred while searching for books by title" });
      }
    });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  try {
    const isbn = req.params.isbn;

    if (books[isbn]) {
      return res.status(200).json({
        isbn: isbn,
        reviews: books[isbn].reviews,
      });
    } else {
      return res.status(404).json({ message: `找不到 ISBN ${isbn} 对应的书籍评论` });
    }
  } catch (error) {
    return res.status(500).json({ message: "获取书籍评论时发生错误" });
  }
});

module.exports.general = public_users;
