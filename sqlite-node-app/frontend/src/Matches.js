// src/Matches.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [selectedGender, setSelectedGender] = useState("");

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

  // Handle dropdown selection
  const handleGenderChange = (event) => {
    const gender = event.target.value;
    setSelectedGender(gender);

    if (gender === "") {
      setFilteredMatches(matches); // Show all matches if no filter is applied
      return;
    }

    // Filter matches based on selected gender
    const filtered = matches.filter((match) => {
      const team1Gender = JSON.parse(match.Team1_Gender); // Parse JSON string
      const team2Gender = JSON.parse(match.Team2_Gender);
      return team1Gender.includes(gender) || team2Gender.includes(gender);
    });

    setFilteredMatches(filtered);
  };

  return (
    <div>
      <h2>Match List</h2>

      {/* Dropdown to select gender */}
      <label htmlFor="genderFilter">Filter by Gender: </label>
      <select id="genderFilter" value={selectedGender} onChange={handleGenderChange}>
        <option value="">All</option>
        <option value="M">Male</option>
        <option value="F">Female</option>
      </select>

      {/* Display filtered matches */}
      <table border="1">
        <thead>
          <tr>
            <th>Date</th>
            <th>Tournament</th>
            <th>Round</th>
            <th>Players</th>
            <th>Gender</th>
          </tr>
        </thead>
        <tbody>
          {filteredMatches.map((match, index) => (
            <tr key={index}>
              <td>{match.Date}</td>
              <td>{match.Tournament}</td>
              <td>{match.Round}</td>
              <td>
                {JSON.parse(match.Team1_Names).join(", ")} vs {JSON.parse(match.Team2_Names).join(", ")}
              </td>
              <td>
                {JSON.parse(match.Team1_Gender).join(", ")} vs {JSON.parse(match.Team2_Gender).join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Matches;
