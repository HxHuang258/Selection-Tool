import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import * as XLSX from 'xlsx';  // Import xlsx for Excel export

const Matches = () => {
  const [matchesByFilterSet, setMatchesByFilterSet] = useState([]);
  const [filters, setFilters] = useState([
    { selectedAgeGroup: [], selectedRound: [], selectedLevel: [] }
  ]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  // Format date into yyyy-mm-dd
  const formatDate = (date) => {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${year}-${month}-${day}`;
  };

  // Fetch filtered data for each filter set
  const fetchMatches = async () => {
    setLoading(true);

    try {
      const filterRequests = filters.map(filter =>
        axios.get('http://localhost:3000/filtered-data', {
          params: {
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
            ageGroup: Array.isArray(filter.selectedAgeGroup) ? filter.selectedAgeGroup.map(option => option.value) : [],
            round: Array.isArray(filter.selectedRound) ? filter.selectedRound.map(option => option.value) : [],
            level: Array.isArray(filter.selectedLevel) ? filter.selectedLevel.map(option => option.value) : [],
          }
        })
      );

      const responses = await Promise.all(filterRequests);
const groupedByFilterSet = [];

responses.forEach((response, filterIndex) => {
  let filterMatches = response.data;

  if (typeof filterMatches === 'object' && !Array.isArray(filterMatches)) {
    // If response is an object (grouped by player), flatten it to an array
    filterMatches = Object.values(filterMatches).flat();
  }

  if (!Array.isArray(filterMatches)) {
    console.error(`Error: filterMatches for filter set ${filterIndex} is not an array`, filterMatches);
    return;
  }

  const groupedByPlayer = {};

  filterMatches.forEach((match) => {
    try {
      const team1 = JSON.parse(match.Team1_Names);
      const team2 = JSON.parse(match.Team2_Names);
      const players = [...team1, ...team2];

      players.forEach((playerName) => {
        if (!groupedByPlayer[playerName]) {
          groupedByPlayer[playerName] = [];
        }
        groupedByPlayer[playerName].push(match);
      });
    } catch (error) {
      console.error('Error parsing player names:', error, match);
    }
  });

  groupedByFilterSet.push({ filterIndex, groupedByPlayer });
});

setMatchesByFilterSet(groupedByFilterSet);
    } catch (error) {
      console.error('Error fetching data:', error);
    }

    setLoading(false);
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

  // Export table data to Excel
  const exportToExcel = () => {
    const data = [];
    matchesByFilterSet.forEach((filterSet) => {
      Object.keys(filterSet.groupedByPlayer).forEach((player) => {
        filterSet.groupedByPlayer[player].forEach((match) => {
          data.push({
            Player: player,
            Date: match.Date,
            Tournament: match.Tournament,
            Round: match.Round,
            Level: match.Level,
          });
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Matches');
    XLSX.writeFile(wb, 'Matches.xlsx');
  };

  return (
    <div className="p-5">
      <h2>Match Results</h2>

      {/* Date Filters */}
      <label>Start Date:</label>
      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

      <label>End Date:</label>
      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

      {/* Filter Sets */}
      {filters.map((filter, index) => (
        <div key={index}>
          <h3>Filter Set {index + 1}</h3>

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
            classNamePrefix="select"
          />
        </div>
      ))}

      <button onClick={addFilterSet}>Add New Filter Set</button>
      <button onClick={fetchMatches}>Apply Filters</button>
      <button onClick={exportToExcel}>Export to Excel</button>

      {/* Match Display */}
      {/* Match Display */}
{loading ? <p>Loading...</p> : (
  <div className="matches-container" style={{ padding: '20px' }}>
    {matchesByFilterSet.map(({ filterIndex, groupedByPlayer }) => {
      // Group matches by event first, then by player
      const groupedByEvent = {};

      Object.entries(groupedByPlayer).forEach(([player, matches]) => {
        matches.forEach(match => {
          if (!groupedByEvent[match.Event]) {
            groupedByEvent[match.Event] = {};
          }
          if (!groupedByEvent[match.Event][player]) {
            groupedByEvent[match.Event][player] = [];
          }
          groupedByEvent[match.Event][player].push(match);
        });
      });

      return (
        <div key={filterIndex}>
          <h3 style={{ marginBottom: '10px', fontSize: '24px' }}>Filter Set {filterIndex + 1} Results</h3>

          {/* Loop through each event */}
          {Object.entries(groupedByEvent).map(([event, players]) => (
            <div key={event} style={{ marginBottom: '30px' }}>
              <h2 style={{ fontSize: '28px', marginBottom: '15px', color: '#2c3e50' }}>{event}</h2>

              {/* Loop through each player in this event */}
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {Object.entries(players).map(([player, matches]) => {
                  // ✅ Remove duplicates
                  const uniqueMatches = Array.from(new Map(matches.map(m => [m.MatchID, m])).values());

                  return (
                    <div key={player} style={{ width: '30%', margin: '10px', background: '#ecf0f1', borderRadius: '8px', padding: '15px' }}>
                      <h4 style={{ fontWeight: 'bold', marginBottom: '10px' }}>{player}</h4>

                      <table style={{ width: '100%', borderCollapse: 'collapse' }} border="1">
                        <thead style={{ backgroundColor: '#3498db', color: '#fff' }}>
                          <tr>
                            <th>Date</th>
                            <th>Tournament</th>
                            <th>Players</th>
                          </tr>
                        </thead>
                        <tbody>
                          {uniqueMatches.map((match) => {
                            const team1Players = JSON.parse(match.Team1_Names);
                            const team2Players = JSON.parse(match.Team2_Names);

                            let playerSide, opponentSide;

                            if (team1Players.includes(player)) {
                              playerSide = team1Players;
                              opponentSide = team2Players;
                            } else {
                              playerSide = team2Players;
                              opponentSide = team1Players;
                            }

                            return (
                              <tr key={match.MatchID}>
                                <td style={{ padding: '8px' }}>{match.Date}</td>
                                <td style={{ padding: '8px' }}>{match.Tournament}</td>
                                <td style={{ padding: '8px' }}>
                                  <strong>{player}</strong>, {playerSide.filter(p => p !== player).join(", ")} vs {opponentSide.join(", ")}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      );
    })}
  </div>
)}
    </div>
  );
};

export default Matches;