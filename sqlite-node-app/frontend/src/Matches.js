// src/Matches.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("");
  const [selectedRound, setSelectedRound] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch filtered data from backend
  const fetchMatches = () => {
    setLoading(true);
    axios.get('http://localhost:3000/filtered-data', {
      params: { 
        startDate, 
        endDate, 
        gender: selectedGender, 
        ageGroup: selectedAgeGroup, 
        round: selectedRound,
        level: selectedLevel,
        event: selectedEvent,
      }
    })
      .then((response) => {
        setMatches(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMatches(); // Fetch matches when component mounts
  }, []);

  // Handle filter changes
  const handleFilterChange = () => {
    fetchMatches();
  };

  return (
    <div>
      <h2>Match List</h2>

      {/* Filters */}
      <label>Start Date:</label>
      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      <label>End Date:</label>
      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

      <label>Gender:</label>
      <select value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)}>
        <option value="">All</option>
        <option value="M">Male</option>
        <option value="F">Female</option>
      </select>

      <label>Age Group:</label>
      <select value={selectedAgeGroup} onChange={(e) => setSelectedAgeGroup(e.target.value)}>
        <option value="">All</option>
        <option value="U11">U11</option>
        <option value="U13">U13</option>
        <option value="U15">U15</option>
        <option value="U17">U17</option>
        <option value="U19">U19</option>
      </select>

      <label>Round:</label>
      <select value={selectedRound} onChange={(e) => setSelectedRound(e.target.value)}>
        <option value="">All</option>
        <option value="Round 1">Round 1</option>
        <option value="Round 2">Round 2</option>
        <option value="Round 3">Round 3</option>
      </select>

      <label>Level:</label>
      <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}>
        <option value="">All</option>
        <option value="Bronze">Bronze</option>
        <option value="Silver">Silver</option>
        <option value="Gold">Gold</option>
      </select>

      <label>Event:</label>
      <select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}>
        <option value="">All</option>
        <option value="OS">OS</option>
        <option value="OD">OD</option>
        <option value="XD">XD</option>
      </select>

      <button onClick={handleFilterChange}>Apply Filters</button>

      {/* Matches Table */}
      <table border="1">
        <thead>
          <tr>
            <th>Date</th>
            <th>Tournament</th>
            <th>Round</th>
            <th>Level</th>
            <th>Event</th>
            <th>Players</th>
            <th>Gender</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match, index) => (
            <tr key={index}>
              <td>{match.Date}</td>
              <td>{match.Tournament}</td>
              <td>{match.Round}</td>
              <td>{match.Level}</td>
              <td>{match.Event}</td>
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
