const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET; // Access the secret from environment variables

const isValid = (username) => {
    // Check if the username exists in the users array
    return users.some(user => user.username === username);
}

const session = require('express-session');

// Middleware to authenticate using JWT
function authenticateJWT(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from "Bearer <token>"

    if (token) {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403); // Forbidden
            }
            req.user = user; // Save user info to request object
            next(); // Proceed to the next middleware or route handler
        });
    } else {
        res.sendStatus(401); // Unauthorized
    }
}

// Check if user is authenticated
const authenticatedUser = (username, password) => {
    // Check if the username and password match any user in the records
    const user = users.find(u => u.username === username && u.password === password);
    return user !== undefined; // Returns true if user is found, false otherwise
};

// Only registered users can login
regd_users.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if the user exists and the password matches
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate a JWT token
    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });

    // Return the token to the client
    return res.status(200).json({ message: "Login successful", token });
});

// Add or modify a book review
regd_users.get('/review/:isbn', authenticateJWT, (req, res) => {
    const { review } = req.query; // Get the review from the query parameters
    const isbn = req.params.isbn; // Get the ISBN from the URL parameters
    const username = req.user.username; // Get the username from the decoded token

    // Find the book by ISBN
    const book = books.find(b => b.isbn === isbn);
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if the user has already reviewed this book
    if (book.reviews[username]) {
        // Modify the existing review
        book.reviews[username] = review;
        return res.status(200).json({ message: "Review updated successfully" });
    } else {
        // Add a new review
        book.reviews[username] = review;
        return res.status(201).json({ message: "Review added successfully" });
    }
});

// Delete a book review
regd_users.delete('/auth/review/:isbn', authenticateJWT, (req, res) => {
    const isbn = req.params.isbn; // Get the ISBN from the URL parameters
    const username = req.user.username; // Get the username from the decoded token

    console.log(`Attempting to delete review for ISBN: ${isbn} by user: ${username}`);

    // Find the book by ISBN
    const book = books.find(b => b.isbn === isbn);
    if (!book) {
        console.log("Book not found");
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if the user has a review for this book
    if (book.reviews && book.reviews[username]) {
        // Delete the review
        delete book.reviews[username];
        console.log("Review deleted successfully");
        return res.status(200).json({ message: "Review deleted successfully" });
    } else {
        console.log("Review not found for this user");
        return res.status(404).json({ message: "Review not found for this user" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
