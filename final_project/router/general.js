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
          username: username ? "已提供" : "缺失",
          password: password ? "已提供" : "缺失",
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
  try {
    const booksList = JSON.stringify(books, null, 2);
    res.status(200).send(booksList);
  } catch (error) {
    res.status(500).json({ message: "Error occurred while getting books list" });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  try {
    const isbn = req.params.isbn;

    // 检查 ISBN 是否存在于书籍数据中
    if (books[isbn]) {
      return res.status(200).json(books[isbn]);
    } else {
      return res.status(404).json({ message: `找不到 ISBN ${isbn} 对应的书籍` });
    }
  } catch (error) {
    return res.status(500).json({ message: "获取书籍详情时发生错误" });
  }
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  try {
    const requestedAuthor = req.params.author;
    const booksByAuthor = Object.keys(books)
      .filter((isbn) => books[isbn].author.toLowerCase() === requestedAuthor.toLowerCase())
      .reduce((result, isbn) => {
        result[isbn] = books[isbn];
        return result;
      }, {});

    if (Object.keys(booksByAuthor).length > 0) {
      return res.status(200).json(booksByAuthor);
    } else {
      return res.status(404).json({ message: `找不到作者 ${requestedAuthor} 的书籍` });
    }
  } catch (error) {
    return res.status(500).json({ message: "搜索作者书籍时发生错误" });
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  try {
    const requestedTitle = req.params.title;
    const booksByTitle = Object.keys(books)
      .filter((isbn) => books[isbn].title.toLowerCase().includes(requestedTitle.toLowerCase()))
      .reduce((result, isbn) => {
        result[isbn] = books[isbn];
        return result;
      }, {});

    if (Object.keys(booksByTitle).length > 0) {
      return res.status(200).json(booksByTitle);
    } else {
      return res.status(404).json({ message: `找不到标题包含 ${requestedTitle} 的书籍` });
    }
  } catch (error) {
    return res.status(500).json({ message: "搜索书籍标题时发生错误" });
  }
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
