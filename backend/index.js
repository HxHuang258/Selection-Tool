require("dotenv").config();
const cors = require('cors');
console.log("Cloud SQL Connection Name:", process.env.INSTANCE_CONNECTION_NAME);


const express = require("express");
const mysql = require("mysql2");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Create a connection pool to Cloud SQL
const pool = mysql.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: "127.0.0.1",  // Use TCP instead of Unix socket
    port: 3306, // Default MySQL port
  });
  

// Test Database Connection
pool.query("SELECT NOW()", (error, results) => {
  if (error) {
    console.error("Database connection failed:", error);
  } else {
    console.log("Connected to Cloud SQL! Current time:", results[0]["NOW()"]);
  }
});

// Sample API Route to Fetch Data
app.get("/test-query", (req, res) => {
    pool.query("SELECT DISTINCT TOURNAMENT FROM all_matches", (error, results) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      res.json({ message: "Query successful", 
        data: results.map(result => ({ Tournament: result.Tournament })) 
    });
    });
  });

// Start Express Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
