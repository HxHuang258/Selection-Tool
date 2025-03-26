const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

function convertToDDMMYYYY(date) {
  const [year, month, day] = date.split('-');
  return `${year}-${month}-${day}`;
}

// Read the .sql file
const sqlScript = fs.readFileSync(path.join(__dirname, 'database/updated_sql_script.sql'), 'utf8');

// Create a new SQLite database (or open an existing one)
const db = new sqlite3.Database(path.join(__dirname, 'database/updated_sql_script.db'), (err) => {
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
  let { startDate, endDate, ageGroup, round, level, event } = req.query;
  let query = 'SELECT * FROM all_matches WHERE 1=1';
  let params = [];

  // Convert startDate and endDate to dd/mm/yyyy format for SQLite comparison
  if (startDate && endDate) {
    startDate = convertToDDMMYYYY(startDate);
    endDate = convertToDDMMYYYY(endDate);
    query += ' AND Date BETWEEN ? AND ?';
    params.push(startDate, endDate);
  }

  // Age group filter (if provided)
  if (ageGroup) {
    // Flatten the array if it is nested
    const ageGroups = Array.isArray(ageGroup) ? ageGroup.flat() : [ageGroup];
    const placeholders = ageGroups.map(() => '?').join(', ');
    query += ` AND Age IN (${placeholders})`;
    params.push(...ageGroups);
  }

  if (round) {
    // Flatten the array if it is nested
    const rounds = Array.isArray(round) ? round.flat() : [round];
    const placeholders = round.map(() => '?').join(', ');
    query += ` AND Round IN (${placeholders})`;
    params.push(...rounds);
  }

  if (level) {
    // Flatten the array if it is nested
    const levels = Array.isArray(level) ? level.flat() : [level];
    const placeholders = level.map(() => '?').join(', ');
    query += ` AND Level IN (${placeholders})`;
    params.push(...levels);
  }

  // Limit the results to 100 rows
  query += ' ORDER BY Date ASC LIMIT 100';
  
    // Execute SQL query
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error(err.message);
        return res.status(500).send('Error retrieving data');
      }
    
      // Organize data by player
      const playerMatches = {};
      const seenMatches = new Set(); // Store unique MatchIDs
    
      rows.forEach((match) => {
        const matchId = match.MatchID;
    
        // Only process if this match hasn't been added before
        if (!seenMatches.has(matchId)) {
          seenMatches.add(matchId);
    
          const players = [
            ...JSON.parse(match.Team1_Names),
            ...JSON.parse(match.Team2_Names),
          ];
    
          players.forEach((playerName) => {
            if (!playerMatches[playerName]) {
              playerMatches[playerName] = [];
            }
            playerMatches[playerName].push(match); // Group matches by player
          });
        }
      });
    
      res.json(playerMatches); // Send grouped data as response
    });
    

    console.log('Final Query:', query);
    console.log('Final Params:', params);  
  });
  





// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
