const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  // 检查用户名是否存在
  return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  //returns boolean
  // 检查用户名和密码是否匹配
  return users.some((user) => user.username === username && user.password === password);
};
//only registered users can login
regd_users.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({
        message: "Login failed: Username and password are required",
        details: {
          username: username ? "provided" : "missing",
          password: password ? "provided" : "missing",
        },
      });
    }

    // Validate user credentials
    if (!authenticatedUser(username, password)) {
      return res.status(401).json({
        message: "Login failed: Username or password is incorrect",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { username: username },
      "access", // Use the same key as in index.js
      { expiresIn: "1h" }
    );

    // Store token in session
    req.session.authorization = {
      accessToken: token,
    };

    return res.status(200).json({
      message: "Login successful",
      username: username,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error occurred during login",
      error: error.message,
    });
  }
});
// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  try {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.user.username; // Get username from req.user set by middleware in index.js

    // Validate required parameters
    if (!isbn || !review) {
      return res.status(400).json({
        message: "Failed to add review: ISBN and review content are required",
      });
    }

    // Check if the book exists
    if (!books[isbn]) {
      return res.status(404).json({
        message: `Book with ISBN ${isbn} not found`,
      });
    }

    // Ensure reviews object exists
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }

    // Add or update review
    books[isbn].reviews[username] = review;

    return res.status(200).json({
      message: "Review successfully added/updated",
      isbn: isbn,
      username: username,
      review: review,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error occurred while adding review",
      error: error.message,
    });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  try {
    const isbn = req.params.isbn;
    const username = req.user.username; // Get username from req.user set by middleware in index.js

    // Check if the book exists
    if (!books[isbn]) {
      return res.status(404).json({
        message: `Book with ISBN ${isbn} not found`,
      });
    }

    // Check if the book has a review
    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
      return res.status(404).json({
        message: "Your review for this book not found",
      });
    }

    // Delete review
    delete books[isbn].reviews[username];

    return res.status(200).json({
      message: "Review successfully deleted",
      isbn: isbn,
      username: username,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error occurred while deleting review",
      error: error.message,
    });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
