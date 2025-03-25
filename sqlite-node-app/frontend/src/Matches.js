import React, { useState, useEffect } from 'react';
import Select from 'react-select'
import axios from 'axios';

const ageGroupOptions = [
    { value: 'U11', label: 'U11' },
    { value: 'U13', label: 'U13' },
    { value: 'U15', label: 'U15' },
    { value: 'U17', label: 'U17' },
    { value: 'U19', label: 'U19' },
];


const Matches = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAgeGroup, setSelectedAgeGroup] = useState([]);
    const [selectedRound, setSelectedRound] = useState("");
    const [selectedLevel, setSelectedLevel] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Format the date into yyyy-mm-dd (for use in the backend)
    const formatDate = (date) => {
        if (!date) return '';
        const [year, month, day] = date.split('-');
        return `${year}-${month}-${day}`;
    };

    // Fetch filtered data from backend
    const fetchMatches = () => {
        setLoading(true);
        axios.get('http://localhost:3000/filtered-data', {
            params: {
                startDate: formatDate(startDate),
                endDate: formatDate(endDate),
                ageGroup: Array.isArray(selectedAgeGroup) ? selectedAgeGroup.map(option => option.value) : [],
                round: selectedRound,
                level: selectedLevel,
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
                value={selectedAgeGroup} // ✅ Ensure value is always an array
                onChange={(selected) => setSelectedAgeGroup(selected || [])} // ✅ If `null`, set an empty array
                className="basic-multi-select"
                classNamePrefix="select"
            />

            <label>Round:</label>
            <select value={selectedRound} onChange={(e) => setSelectedRound(e.target.value)}>
                <option value="">All</option>
                <option value="Semi-Final">Semi-Final</option>
                <option value="Final">Final</option>
            </select>

            <label>Level:</label>
            <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}>
                <option value="">All</option>
                <option value="Bronze">Bronze</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Nationals">Nationals</option>
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
                        <th>Players</th>
                    </tr>
                </thead>
                <tbody>
                    {matches.map((match, index) => (
                        <tr key={index}>
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
    );
};

export default Matches;
