const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const axios = require('axios');

// Register new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  users.push({ username, password }); // Remember to hash the password in real applications
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', (req, res) => {
  return res.send(JSON.stringify(books, null, 2));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books.find(b => b.isbn === isbn);

  if (book) {
    return res.send(JSON.stringify(book, null, 2));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on ISBN using Axios (ensure you have a valid API endpoint)
public_users.get('/books/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get(`/books/isbn/${isbn}`); // Ensure you have the correct API URL
    const book = response.data;

    if (book) {
      return res.status(200).json(book);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    console.error('Error fetching book details:', error);
    return res.status(500).json({ message: 'Error fetching book details' });
  }
});

// Get book details based on author
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();
  const booksByAuthor = books.filter(b => b.author.toLowerCase() === author);

  if (booksByAuthor.length > 0) {
    return res.send(JSON.stringify(booksByAuthor, null, 2));
  } else {
    return res.status(404).json({ message: "No books found by this author" });
  }
});

// Get book details based on Author using Axios
public_users.get('/boauthor/:authoroks/', async (req, res) => {
  const author = req.params.author;
  try {
    const response = await axios.get(`books/author/${author}`);
    const booksByAuthor = response.data;

    if (booksByAuthor.length > 0) {
      return res.status(200).json(booksByAuthor);
    } else {
      return res.status(404).json({ message: "No books found by this author" });
    }
  } catch (error) {
    console.error('Error fetching books by author:', error);
    return res.status(500).json({ message: 'Error fetching books by author' });
  }
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title;
  const booksByTitle = books.filter(b => b.title === title);

  if (booksByTitle.length > 0) {
    return res.send(JSON.stringify(booksByTitle, null, 2));
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

// Get book details based on Title using Axios
public_users.get('/books/title/:title', async (req, res) => {
  const title = req.params.title;
  try {
    const response = await axios.get(`books/title/${title}`);
    const booksByTitle = response.data;

    if (booksByTitle.length > 0) {
      return res.status(200).json(booksByTitle);
    } else {
      return res.status(404).json({ message: "No books found with this title" });
    }
  } catch (error) {
    console.error('Error fetching books by title:', error);
    return res.status(500).json({ message: 'Error fetching books by title' });
  }
});

// Get book reviews based on ISBN
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books.find(b => b.isbn === isbn);

  if (book) {
    if (book.reviews && Object.keys(book.reviews).length > 0) {
      return res.send(JSON.stringify(book.reviews, null, 2));
    } else {
      return res.status(404).json({ message: "No reviews found for this book" });
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Get the book list available in the shop using Axios
public_users.get('/books', async (req, res) => {
  try {
    const response = await axios.get('/books'); // Ensure you have the correct API URL
    const books = response.data;
    return res.status(200).json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    return res.status(500).json({ message: 'Error fetching books' });
  }
});

module.exports.general = public_users;
