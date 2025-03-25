import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';

const Matches = () => {
  const [matchesByFilterSet, setMatchesByFilterSet] = useState([]); // To store matches grouped by filter set and player
  const [filters, setFilters] = useState([{
    selectedAgeGroup: [],
    selectedRound: [],
    selectedLevel: [],
  }]); // Multiple filter sets
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  // Format the date into yyyy-mm-dd (for use in the backend)
  const formatDate = (date) => {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${year}-${month}-${day}`;
  };

  // Fetch filtered data for each filter set
  const fetchMatches = () => {
    setLoading(true);

    const filterRequests = filters.map((filter, index) => {
      return axios.get('http://localhost:3000/filtered-data', {
        params: {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          ageGroup: Array.isArray(filter.selectedAgeGroup) ? filter.selectedAgeGroup.map(option => option.value) : [],
          round: Array.isArray(filter.selectedRound) ? filter.selectedRound.map(option => option.value) : [],
          level: Array.isArray(filter.selectedLevel) ? filter.selectedLevel.map(option => option.value) : [],
        }
      });
    });

    // Wait for all filter requests and process the results
    Promise.all(filterRequests)
      .then((responses) => {
        const groupedByFilterSet = [];

        responses.forEach((response, filterIndex) => {
          const filterMatches = response.data;
          const groupedByPlayer = {};

          // Group matches by player for this filter set
          filterMatches.forEach((match) => {
            const players = [
              ...JSON.parse(match.Team1_Names),
              ...JSON.parse(match.Team2_Names),
            ];

            players.forEach((playerName) => {
              if (!groupedByPlayer[playerName]) {
                groupedByPlayer[playerName] = [];
              }
              // Add match to the player's array
              groupedByPlayer[playerName].push(match);
            });
          });

          // Push grouped matches for this filter set
          groupedByFilterSet.push({ filterIndex, groupedByPlayer });
        });

        setMatchesByFilterSet(groupedByFilterSet);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  };

  // Add new filter set
  const addFilterSet = () => {
    setFilters([...filters, { selectedAgeGroup: [], selectedRound: [], selectedLevel: [] }]);
  };

  // Handle filter changes
  const handleFilterChange = (index, field, value) => {
    const updatedFilters = [...filters];
    updatedFilters[index] = { ...updatedFilters[index], [field]: value };
    setFilters(updatedFilters);
  };

  useEffect(() => {
    fetchMatches(); // Fetch matches when component mounts or filters change
  }, [filters]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ marginRight: '10px' }}>Results from:</h2>

        {/* Date Inputs Inline */}
        <label style={{ marginRight: '10px' }}>Start Date:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ marginRight: '20px' }}
        />

        <label style={{ marginRight: '10px' }}>End Date:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ marginRight: '20px' }}
        />
      </div>

      {/* Render Multiple Filter Sets */}
      {filters.map((filter, index) => (
        <div key={index}>
          <h3>Filter Set {index + 1}</h3>

          {/* Multi-Select for Age Group */}
          <label>Age Group:</label>
          <Select
            isMulti
            options={[
              { value: 'U11', label: 'U11' },
              { value: 'U13', label: 'U13' },
              { value: 'U15', label: 'U15' },
              { value: 'U17', label: 'U17' },
              { value: 'U19', label: 'U19' }
            ]}
            value={filter.selectedAgeGroup}
            onChange={(selected) => handleFilterChange(index, 'selectedAgeGroup', selected || [])}
            className="basic-multi-select"
            classNamePrefix="select"
          />

          <label>Round:</label>
          <Select
            isMulti
            options={[
              { value: 'Semi-Final', label: 'Semi-Final' },
              { value: 'Final', label: 'Final' }
            ]}
            value={filter.selectedRound}
            onChange={(selected) => handleFilterChange(index, 'selectedRound', selected || [])}
            className="basic-multi-select"
            classNamePrefix="select"
          />

          <label>Level:</label>
          <Select
            isMulti
            options={[
              { value: 'Bronze', label: 'Bronze' },
              { value: 'Silver', label: 'Silver' },
              { value: 'Gold', label: 'Gold' },
              { value: 'Nationals', label: 'Nationals' }
            ]}
            value={filter.selectedLevel}
            onChange={(selected) => handleFilterChange(index, 'selectedLevel', selected || [])}
            className="basic-multi-select"
            classNamePrefix="select"
          />
        </div>
      ))}

      <button onClick={addFilterSet}>Add New Filter Set</button>
      <button onClick={fetchMatches}>Apply Filters</button>

      {/* Matches Display */}
      {loading ? <p>Loading...</p> : (
        <div>
          {matchesByFilterSet.map(({ filterIndex, groupedByPlayer }) => (
            <div key={filterIndex}>
              <h3>Filter Set {filterIndex + 1} Results</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {Object.keys(groupedByPlayer).map((player, index) => (
                  <div key={index} style={{ width: '30%', margin: '10px' }}>
                    <h4>{player}</h4>
                    <table border="1">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Tournament</th>
                          <th>Round</th>
                          <th>Level</th>
                          <th>Players</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedByPlayer[player].map((match, matchIndex) => (
                          <tr key={matchIndex}>
                            <td>{match.Date}</td>
                            <td>{match.Tournament}</td>
                            <td>{match.Round}</td>
                            <td>{match.Level}</td>
                            <td>
                              {JSON.parse(match.Team1_Names).join(", ")} vs {JSON.parse(match.Team2_Names).join(", ")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Matches;
