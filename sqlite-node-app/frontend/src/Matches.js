import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import * as XLSX from 'xlsx';  // Import xlsx for Excel export

const Matches = () => {
  const [matchesByFilterSet, setMatchesByFilterSet] = useState([]);
  const [filters, setFilters] = useState([
    { title: "Custom Criteria", selectedAgeGroup: [], selectedRound: [], selectedLevel: [] }
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

  // Function to remove a filter set
  const removeFilterSet = (index) => {
    setFilters(filters.filter((_, i) => i !== index));
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
    const wb = XLSX.utils.book_new();
    const wsData = [];
  
    // Use the user-defined filter set names instead of default titles
    const headerRow = ["Player", ...filters.map(filter => filter.title || `Filter Set ${filters.indexOf(filter) + 1}`)];
    wsData.push(headerRow);
  
    // Collect all unique events and players
    const allPlayers = new Set();
    const allEvents = new Set();
  
    matchesByFilterSet.forEach(({ groupedByPlayer }) => {
      Object.keys(groupedByPlayer).forEach(player => allPlayers.add(player));
      Object.values(groupedByPlayer).flat().forEach(match => allEvents.add(match.Event));
    });
  
    // Process each event separately
    [...allEvents].forEach(event => {
      wsData.push([event]); // Add event header row
  
      [...allPlayers].forEach(player => {
        // Check if player has matches in this event
        const playerHasMatches = matchesByFilterSet.some(({ groupedByPlayer }) =>
          (groupedByPlayer[player] || []).some(match => match.Event === event)
        );
  
        if (!playerHasMatches) return;
  
        const row = [player];
  
        matchesByFilterSet.forEach(({ groupedByPlayer }) => {
          const playerMatches = (groupedByPlayer[player] || []).filter(match => match.Event === event);
          const uniqueMatches = Array.from(new Map(playerMatches.map(m => [m.MatchID, m])).values());
  
          row.push(uniqueMatches.length > 0 ? uniqueMatches.map(match => `${match.Date} - ${match.Tournament}`).join("\n") : "No Matches");
        });
  
        wsData.push(row);
      });
  
      wsData.push([]); // Add an empty row for spacing between events
    });
  
    // Convert data to Excel sheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);
  
    // Auto-fit columns
    ws['!cols'] = wsData[0].map(() => ({ wch: 30 }));
  
    // Merge event headers across filter sets
    ws['!merges'] = ws['!merges'] || [];
    wsData.forEach((row, i) => {
      if (row.length === 1) {
        ws['!merges'].push({ s: { r: i, c: 0 }, e: { r: i, c: filters.length } });
      }
    });
  
    XLSX.utils.book_append_sheet(wb, ws, "Matches");
    XLSX.writeFile(wb, "Matches.xlsx");
  };

  return (
    <div className="p-5">
      <h2>Match Results</h2>

      {/* Date Filters */}
      <label>Start Date:</label>
      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

      <label>End Date:</label>
      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

      {/* Filter Sets - Compact Layout with Remove Button */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
        {filters.map((filter, index) => (
          <div key={index} style={{
            background: '#ecf0f1',
            padding: '10px',
            borderRadius: '5px',
            minWidth: '250px',
            flexGrow: '1',
            position: 'relative'
          }}>
            {/* Remove Button */}
            <button
              onClick={() => removeFilterSet(index)}
              style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                background: 'red',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
              title="Remove Filter Set"
            >
              ✖
            </button>

            <input
              type="text"
              value={filter.title}
              onChange={(e) => handleFilterChange(index, "title", e.target.value)}
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                border: "none",
                background: "transparent",
                width: "100%",
                marginBottom: "5px",
              }}
            />

            {/* Age Group */}
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
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: '30px',
                  fontSize: '12px',
                }),
                menuPortal: (base) => ({
                  ...base,
                  zIndex: 9999, // Ensure dropdown goes above sticky header
                }),
              }}
              menuPortalTarget={document.body} // Makes the dropdown render at the body level, above everything else
            />

            {/* Round */}
            <Select
              isMulti
              options={[
                { value: 'Semi-Final', label: 'Semi-Final' },
                { value: 'Final', label: 'Final' }
              ]}
              value={filter.selectedRound}
              onChange={(selected) => handleFilterChange(index, 'selectedRound', selected || [])}
              classNamePrefix="select"
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: '30px',
                  fontSize: '12px',
                }),
                menuPortal: (base) => ({
                  ...base,
                  zIndex: 9999, // Ensure dropdown goes above sticky header
                }),
              }}
              menuPortalTarget={document.body} // Makes the dropdown render at the body level, above everything else
            />

            {/* Level */}
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
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: '30px',
                  fontSize: '12px',
                }),
                menuPortal: (base) => ({
                  ...base,
                  zIndex: 9999, // Ensure dropdown goes above sticky header
                }),
              }}
              menuPortalTarget={document.body} // Makes the dropdown render at the body level, above everything else
            />
          </div>
        ))}
      </div>

      {/* Buttons for Adding & Applying Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={addFilterSet} style={{ padding: '5px 10px', fontSize: '12px' }}>➕ Add Filter Set</button>
        <button onClick={fetchMatches} style={{ padding: '5px 10px', fontSize: '12px' }}>🔍 Apply Filters</button>
        <button onClick={exportToExcel} style={{ padding: '5px 10px', fontSize: '12px' }}>📤 Export to Excel</button>
      </div>

      {/* Match Display */}
      {loading ? <p>Loading...</p> : (() => {
        // Find all unique players across filter sets
        const allPlayers = new Set();
        const allEvents = new Set();

        matchesByFilterSet.forEach(({ groupedByPlayer }) => {
          Object.keys(groupedByPlayer).forEach(player => allPlayers.add(player));
          Object.values(groupedByPlayer).flat().forEach(match => allEvents.add(match.Event));
        });

        return (
          <div className="matches-container" style={{ padding: '20px' }}>
            {/* Create a table with player names in the first column and each filter set as a separate column */}
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                height: '600px', // Set a fixed height for the table body
                overflowY: 'auto', // Enables scrolling
                display: 'block', // Ensures the table body is scrollable
              }}
              border="1"
            >
              <thead
                style={{
                  backgroundColor: '#3498db',
                  color: '#fff',
                  position: 'sticky', // This makes the header sticky
                  top: 0, // Keeps the header at the top when scrolling
                  zIndex: 1, // Ensures the header stays on top of the table rows
                }}
              >
                <tr>
                  <th style={{ padding: '10px' }}>Player</th>
                  {filters.map((filter, index) => (
                    <th key={index} style={{ padding: '10px' }}>
                      {filter.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...allEvents].map((event) => (
                  <React.Fragment key={event}>
                    {/* Event Header Row */}
                    <tr>
                      <td colSpan={matchesByFilterSet.length + 1} style={{ backgroundColor: '#2c3e50', color: '#fff', fontWeight: 'bold', textAlign: 'center', padding: '10px' }}>
                        {event}
                      </td>
                    </tr>

                    {/* Players in this Event */}
                    {[...allPlayers].map((player) => {
                      const playerHasMatchesInEvent = matchesByFilterSet.some(({ groupedByPlayer }) =>
                        (groupedByPlayer[player] || []).some(match => match.Event === event)
                      );

                      if (!playerHasMatchesInEvent) return null; // Skip player if they have no matches in this event

                      return (
                        <tr key={player}>
                          {/* Player Name Column */}
                          <td style={{ padding: '10px', fontWeight: 'bold' }}>{player}</td>

                          {/* Matches for each filter set */}
                          {matchesByFilterSet.map(({ groupedByPlayer }, filterIndex) => {
                            const playerMatches = (groupedByPlayer[player] || []).filter(match => match.Event === event);
                            const uniqueMatches = Array.from(new Map(playerMatches.map(m => [m.MatchID, m])).values());

                            return (
                              <td key={filterIndex} style={{ padding: '10px' }}>
                                {uniqueMatches.length > 0 ? (
                                  <table style={{ width: '100%', borderCollapse: 'collapse' }} border="1">
                                    <thead>
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
                                            <td>{match.Date}</td>
                                            <td>{match.Tournament}</td>
                                            <td>
                                              <strong>{player}</strong>, {playerSide.filter(p => p !== player).join(", ")} vs {opponentSide.join(", ")}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                ) : (
                                  <span>No Matches</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        );
      })()}
    </div>
  );
};

export default Matches;