// server.js

// Import required modules and set up the Express app
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors'); // Import the CORS middleware

const app = express();
const port = process.env.PORT || 3000;

// Middleware for handling JSON and form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize session
app.use(
  session({
    secret: 'your_secret_key',
    resave: true,
    saveUninitialized: true,
  })
);

// Enable CORS for all routes
app.use(cors());

// Configure MySQL database connection
const db = mysql.createConnection({
  host: 'cis4375group1.crtmtaixighf.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: 'cis4375group1',
  database: 'items',
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.message);
  } else {
    console.log('Database connected');
  }
});

// Route for handling user login
app.post('/login', (req, res) => {
  // Extract user_name and pass_word from the request body
  const { user_name, pass_word } = req.body;

  // Check if both fields are provided
  if (!user_name || !pass_word) {
    return res.status(400).json({ message: 'Please provide both user_name and pass_word.' });
  }

  // Query the database to check for valid credentials
  db.query(
    'SELECT * FROM users WHERE user_name = ? AND pass_word = ?',
    [user_name, pass_word],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Internal server error' });
      }

      // If no matching user found, return an error
      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      // Store the authenticated user's information in a session
      req.session.user = results[0];
      res.status(200).json({ message: 'Login successful' });
    }
  );
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
