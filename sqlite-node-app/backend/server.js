const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// Read the .sql file
const sqlScript = fs.readFileSync(path.join(__dirname, 'database/all_matches.sql'), 'utf8');

// Create a new SQLite database (or open an existing one)
const db = new sqlite3.Database(path.join(__dirname, 'database/all_matches.db'), (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Execute the SQL script to create tables and insert data
db.exec(sqlScript, (err) => {
  if (err) {
    console.error('Error executing SQL script:', err);
  } else {
    console.log('SQL script executed successfully!');
  }
});

app.use(cors({
  origin: 'http://localhost:3001' // Allow requests from React frontend
}));


// A route to get all records from the all_matches table
app.get('/data', (req, res) => {
  db.all('SELECT * FROM all_matches LIMIT 10', [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Error retrieving data');
    }
    res.json(rows); // Return the data as a JSON response
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
