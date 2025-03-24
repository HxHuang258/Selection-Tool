const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

function convertToDDMMYYYY(date) {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

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

app.get('/filtered-data', (req, res) => {
  let { startDate, endDate, gender, ageGroup, round, level, event } = req.query;
  let query = 'SELECT * FROM all_matches WHERE 1=1';
  let params = [];

  // Convert startDate and endDate to dd/mm/yyyy format for SQLite comparison
  if (startDate && endDate) {
    startDate = convertToDDMMYYYY(startDate);
    endDate = convertToDDMMYYYY(endDate);
    query += ' AND Date BETWEEN ? AND ?';
    params.push(startDate, endDate);
  }

  // Gender filter (if provided)
  if (gender) {
    query += ` AND (
      EXISTS (SELECT 1 FROM json_each(Team1_Gender) WHERE json_each.value = ?) 
      OR EXISTS (SELECT 1 FROM json_each(Team2_Gender) WHERE json_each.value = ?)
    )`;
    params.push(gender, gender);
  }

  // Age group filter (if provided)
  if (ageGroup) {
    query += ' AND Age = ?';
    params.push(ageGroup);
  }

  // Round filter (if provided)
  if (round) {
    query += ' AND Round = ?';
    params.push(round);
  }

  // Level filter (if provided)
  if (level) {
    query += ' AND Level = ?';
    params.push(level);
  }

  // Event filter (if provided)
  if (event) {
    query += ' AND Event = ?';
    params.push(event);
  }

  // Limit the results to 100 rows
  query += ' LIMIT 100';

  // Execute the query
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Error retrieving data');
    }
    res.json(rows); // Return the filtered rows as JSON
  });

  console.log('Final Query:', query);
  console.log('Final Params:', params);  
});





// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
