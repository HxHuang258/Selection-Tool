// src/Matches.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from the backend API
  useEffect(() => {
    axios.get('http://localhost:3000/data')  // Make sure your backend is running at this URL
      .then((response) => {
        setMatches(response.data);  // Store the fetched data in state
        setLoading(false);           // Stop loading when data is fetched
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  // Render the data
  return (
    <div>
      <h2>Match List</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border="1">
          <thead>
            <tr>
              <th>Date</th>
              <th>Tournament</th>
              <th>Round</th>
              <th>Players</th>
              <th>Set Scores</th>
              <th>Winner</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match, index) => (
              <tr key={index}>
                <td>{match.Date}</td>
                <td>{match.Tournament}</td>
                <td>{match.Round}</td>
                <td>
                  {/** Parse JSON String Arrays into Normal Arrays **/}
                  {JSON.parse(match.Team1_Names).join(", ")} vs {JSON.parse(match.Team2_Names).join(", ")}
                </td>
                <td>
                  {/** Parse Set Scores Correctly **/}
                  {JSON.parse(match.Set_Scores).map((set, i) => (
                    <p key={i}>
                      {set.Set_Team1} - {set.Set_Team2}
                    </p>
                  ))}
                </td>
                <td>{match.Winner === "1" ? match.Team1_Names : match.Team2_Names}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Matches;
