import React, { useEffect, useMemo, useState } from 'react';
import styles from '../Styles/TravelDistanceHistory.module.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const RECORDS_PER_PAGE = 5;

const TravelDistanceHistory = ({ token }) => {
  const [distanceData, setDistanceData] = useState([]);
  const [searchDate, setSearchDate] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userFullDistance, setUserFullDistance] = useState([]);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageToday, setCurrentPageToday] = useState(1);

  const todayDate = useMemo(() => new Date().toLocaleDateString(), []);

  useEffect(() => {
    if (!searchDate && !searchEmail) {
      fetchTodayDistances();
    }
  }, [token, searchDate, searchEmail]);

  const fetchTodayDistances = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/admin/distance/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch today's distance data");

      const data = await res.json();
      setDistanceData(data.sort((a, b) => b.totalDistance - a.totalDistance));
      setCurrentPageToday(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchDate && !searchEmail) return fetchTodayDistances();

    setLoading(true);
    setError('');
    setShowFullHistory(false);
    setUserFullDistance([]);
    setSelectedUserName('');
    setCurrentPage(1);
    setCurrentPageToday(1);

    // try {
    //   const params = new URLSearchParams();
    //   if (searchDate) params.append('date', searchDate);
    //   if (searchEmail) params.append('email', searchEmail);

    //   const res = await fetch(`${BACKEND_URL}/admin/distance/search?${params}`, {
    //     headers: { Authorization: `Bearer ${token}` },
    //   });

    //   if (!res.ok) throw new Error('Search failed');
    //   const data = await res.json();
    //   setDistanceData(data.sort((a, b) => b.totalDistance - a.totalDistance));
    // } catch (err) {
    //   setError(err.message);
    // } finally {
    //   setLoading(false);
    // }
    try {
  const params = new URLSearchParams();
  if (searchDate) params.append('date', searchDate);
  if (searchEmail) params.append('email', searchEmail);

  const res = await fetch(`${BACKEND_URL}/admin/distance/search?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Search failed');
  }

  const data = await res.json();
  // Sort and set data according to your requirements here...
  setDistanceData(data);

} catch (err) {
  // Show the popup message here
  // alert(err.message);
  setError(err.message);
} finally {
  setLoading(false);
}


  };

  const fetchUserDistanceHistory = async (userId, userName) => {
    if (showFullHistory && selectedUserName === userName) {
      setShowFullHistory(false);
      setUserFullDistance([]);
      setSelectedUserName('');
      setCurrentPage(1);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/admin/distance/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch history');

      const data = await res.json();
      setUserFullDistance(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
      setShowFullHistory(true);
      setSelectedUserName(userName);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message);
    }
  };

  const totalPages = Math.ceil(userFullDistance.length / RECORDS_PER_PAGE);
  const startIdx = (currentPage - 1) * RECORDS_PER_PAGE;
  const currentRecords = userFullDistance.slice(startIdx, startIdx + RECORDS_PER_PAGE);

  const totalPagesToday = Math.ceil(distanceData.length / RECORDS_PER_PAGE);
  const startIdxToday = (currentPageToday - 1) * RECORDS_PER_PAGE;
  const currentRecordsToday = distanceData.slice(startIdxToday, startIdxToday + RECORDS_PER_PAGE);

  const cellStyle = {
    padding: '8px',
    border: '1px solid #ccc',
    textAlign: 'center',
  };

  return (
    <div>
      <h2>Today's Travel Distances – {todayDate}</h2>

      {/* Search Filters */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ marginRight: '10px' }}>
          Date:{' '}
          <input
            type="date"
            value={searchDate}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => setSearchDate(e.target.value)}
          />
        </label>
        <label style={{ marginRight: '10px' }}>
          Email:{' '}
          <input
            type="email"
            placeholder="user@example.com"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
          />
        </label>
        <button onClick={handleSearch} className={styles.button}>
  Search
</button>
<button
  onClick={() => {
    setSearchDate('');
    setSearchEmail('');
    setError('');
    setShowFullHistory(false);
    setUserFullDistance([]);
    setSelectedUserName('');
    fetchTodayDistances();
  }}
  className={styles.resetButton}
>
  Reset
</button>


      </div>

      {loading && <p style={{ textAlign: 'center' }}>Loading...</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      {!loading && currentRecordsToday.length > 0 && (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={cellStyle}>Name</th>
                <th style={cellStyle}>Email</th>
                <th style={cellStyle}>Date</th>
                <th style={cellStyle}>Distance (km)</th>
                <th style={cellStyle}>Full History</th>
              </tr>
            </thead>
            <tbody>
              {currentRecordsToday.map((record, idx) => (
                <tr key={idx}>
                  <td style={cellStyle}>{record.userId?.name || 'N/A'}</td>
                  <td style={cellStyle}>{record.userId?.email || 'N/A'}</td>
                  <td style={cellStyle}>{new Date(record.date).toLocaleDateString()}</td>
                  <td style={cellStyle}>{record.totalDistance.toFixed(2)} km</td>
                  <td style={cellStyle}>
                    <button
  onClick={() =>
    fetchUserDistanceHistory(record.userId._id, record.userId.name)
  }
  className={
    showFullHistory && selectedUserName === record.userId.name
      ? styles.orangeButton  // Hide button orange
      : styles.greenButton   // View button green
  }
>
  {showFullHistory && selectedUserName === record.userId.name
    ? 'Hide'
    : 'View'}
</button>


                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination for today's records */}
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <button
              onClick={() => setCurrentPageToday((p) => Math.max(p - 1, 1))}
              disabled={currentPageToday === 1}
              className={styles.button}
            >
              Prev
            </button>
            Page {currentPageToday} of {totalPagesToday}
            <button
              onClick={() => setCurrentPageToday((p) => Math.min(p + 1, totalPagesToday))}
              disabled={currentPageToday === totalPagesToday}
              className={styles.button}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Full Distance History */}
      {showFullHistory && (
        <div style={{ marginTop: '20px' }}>
          <h3>
            Full Travel Distance History for:{' '}
            <span style={{ color: 'green' }}>{selectedUserName}</span>
          </h3>
          {currentRecords.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9f9f9' }}>
                    <th style={cellStyle}>Date</th>
                    <th style={cellStyle}>Distance (km)</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((entry, idx) => (
                    <tr key={idx}>
                      <td style={cellStyle}>{new Date(entry.date).toLocaleDateString()}</td>
                      <td style={cellStyle}>{entry.totalDistance.toFixed(2)} km</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className={styles.button}
                >
                  Prev
                </button>
                Page {currentPage} of {totalPages}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={styles.button}
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <p>No history available for {selectedUserName}.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TravelDistanceHistory;
