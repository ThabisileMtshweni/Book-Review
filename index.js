const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Load environment variables from .env file
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET; // Access the secret from environment variables

// Session middleware for /customer
app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

// JWT authentication middleware for all routes
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract Bearer token

    if (!token) return res.sendStatus(401); // No token present

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Invalid token
        req.user = user; // Attach user info to request
        next();
    });
};

// Apply the authentication middleware to specific routes (e.g., /customer/auth/*)
app.use("/customer/auth/*", authenticateToken); // Use the JWT middleware for these routes

const PORT = 5000;

// Use routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Start server
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
