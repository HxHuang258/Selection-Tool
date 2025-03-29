const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const admin = require('firebase-admin');
const axios = require('axios');

const app = express();
const port = 3000;

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(path.join(__dirname, 'config/be-test-a063e-firebase-adminsdk-fbsvc-3b8caad2a0.json')), // Replace with path to your Firebase serviceAccountKey.json
  storageBucket: 'gs://be-test-a063e.firebasestorage.app' // Replace with your Firebase project's bucket
});

const bucket = admin.storage().bucket();

// Function to convert to dd/mm/yyyy
function convertToDDMMYYYY(date) {
  const [year, month, day] = date.split('-');
  return `${year}-${month}-${day}`;
}

// Fetch the SQL script from Firebase Storage
const downloadSQLScript = async () => {
  try {
    const file = bucket.file('updated_sql_script.sql'); // Adjust the path if necessary
    const tempFilePath = path.join(__dirname, 'database/temp_script.sql');

    // Download the SQL file to the server
    await file.download({ destination: tempFilePath });
    console.log('SQL script downloaded from Firebase Storage.');
    return tempFilePath; // Return the path to the downloaded SQL script
  } catch (error) {
    console.error('Error downloading SQL script from Firebase Storage:', error);
    throw new Error('Failed to download SQL script');
  }
};

// Create or open SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'database/updated_sql_script.db'), (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Function to execute the SQL script on the SQLite database
const executeSQLScript = async () => {
  try {
    const sqlFilePath = await downloadSQLScript();
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

    db.exec(sqlScript, (err) => {
      if (err) {
        console.error('Error executing SQL script:', err);
      } else {
        console.log('SQL script executed successfully!');
      }
    });
  } catch (error) {
    console.error('Error executing SQL script:', error);
  }
};

// Execute the SQL script when the server starts
executeSQLScript();

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
    const ageGroups = Array.isArray(ageGroup) ? ageGroup.flat() : [ageGroup];
    const placeholders = ageGroups.map(() => '?').join(', ');
    query += ` AND Age IN (${placeholders})`;
    params.push(...ageGroups);
  }

  if (round) {
    const rounds = Array.isArray(round) ? round.flat() : [round];
    const placeholders = round.map(() => '?').join(', ');
    query += ` AND Round IN (${placeholders})`;
    params.push(...rounds);
  }

  if (level) {
    const levels = Array.isArray(level) ? level.flat() : [level];
    const placeholders = level.map(() => '?').join(', ');
    query += ` AND Level IN (${placeholders})`;
    params.push(...levels);
  }

  // Limit the results to 100 rows
  query += ' ORDER BY Date ASC LIMIT 100';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Error retrieving data');
    }
  
    const playerMatches = {};
    const seenMatches = new Set(); // To track already processed matches (based on sorted teams)
  
    rows.forEach((match) => {
      const team1 = JSON.parse(match.Team1_Names).sort().join(",");
      const team2 = JSON.parse(match.Team2_Names).sort().join(",");
  
      // Create a normalized match ID using the sorted teams (ensure flipped matches are treated the same)
      const normalizedMatchId = [team1, team2].sort().join("|");
  
      // If this match has already been processed, skip it
      if (!seenMatches.has(normalizedMatchId)) {
        seenMatches.add(normalizedMatchId);
  
        const players = [
          ...JSON.parse(match.Team1_Names),
          ...JSON.parse(match.Team2_Names),
        ];
  
        // Group by player
        players.forEach((playerName) => {
          if (!playerMatches[playerName]) {
            playerMatches[playerName] = [];
          }
          playerMatches[playerName].push(match);  // Add the match to the player's list
        });
      }
    });
  
    res.json(playerMatches); // Send the grouped data as response
  });

  console.log('Final Query:', query);
  console.log('Final Params:', params);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});