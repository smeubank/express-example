require("./instrument");

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

const Sentry = require("@sentry/node");

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Connect to SQLite database
const db = new sqlite3.Database(':memory:');

// Create a table
db.serialize(() => {
  db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT)");
});

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Express SQLite app!');
});

// Get all users
app.get('/users', (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.json(rows);
  });
});

// Get a single user by ID
app.get('/users/:id', (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.json(row);
  });
});

// Create a new user
app.post('/users', (req, res) => {
  const { name, email } = req.body;
  db.run("INSERT INTO users (name, email) VALUES (?, ?)", [name, email], function(err) {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.status(201).json({ id: this.lastID });
  });
});

// Update a user
app.put('/users/:id', (req, res) => {
  const id = req.params.id;
  const { name, email } = req.body;
  db.run("UPDATE users SET name = ?, email = ? WHERE id = ?", [name, email, id], function(err) {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.json({ changes: this.changes });
  });
});

// Delete a user
app.delete('/users/:id', (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM users WHERE id = ?", [id], function(err) {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.json({ changes: this.changes });
  });
});

Sentry.setupExpressErrorHandler(app);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
