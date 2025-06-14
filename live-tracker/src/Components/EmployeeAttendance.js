import React, { useEffect, useState, useMemo } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const RECORDS_PER_PAGE = 5;

const colors = {
  blue: '#3182ce',
  blueHover: '#2c5282',
  green: '#38a169',
  greenHover: '#2f855a',
  orange: '#dd6b20',
  orangeHover: '#c05621',
  gray: '#718096',
  grayHover: '#4a5568',
  disabled: '#a0aec0',
};

const buttonBaseStyle = {
  color: 'white',
  border: 'none',
  padding: '7px 16px',
  margin: '0 6px',
  borderRadius: '5px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
};

const EmployeeAttendance = ({ token }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userFullAttendance, setUserFullAttendance] = useState([]);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [showFullAttendance, setShowFullAttendance] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchDate, setSearchDate] = useState('');
  const [searchEmail, setSearchEmail] = useState('');

  const todayDate = useMemo(() => new Date().toLocaleDateString(), []);

  useEffect(() => {
    if (!searchDate && !searchEmail) {
      fetchAttendanceToday();
    }
  }, [token, searchDate, searchEmail]);

  const fetchAttendanceToday = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/attendance/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch attendance');

      const data = await res.json();

      const sortedData = data.sort((a, b) => {
        const timeA = a.loginTime ? new Date(a.loginTime).getTime() : 0;
        const timeB = b.loginTime ? new Date(b.loginTime).getTime() : 0;
        return timeB - timeA;
      });

      setAttendanceData(sortedData);
    } catch (err) {
      setError(err.message);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const isValidSearchDate = (dateStr) => {
    if (!dateStr) return true;
    const inputDate = new Date(dateStr);
    const now = new Date();

    if (isNaN(inputDate.getTime())) return false;
    if (inputDate > now) return false;

    return true;
  };

  const handleSearch = async () => {
    if (!isValidSearchDate(searchDate)) {
      setError('Invalid search date. Date cannot be in the future or invalid.');
      return;
    }

    if (!searchDate && !searchEmail) {
      fetchAttendanceToday();
      return;
    }

    setLoading(true);
    setError('');
    setShowFullAttendance(false);
    setUserFullAttendance([]);
    setSelectedUserName('');
    setCurrentPage(1);

    try {
      const params = new URLSearchParams();
      if (searchDate) params.append('date', searchDate);
      if (searchEmail) params.append('email', searchEmail);

      const res = await fetch(`${BACKEND_URL}/attendance/search?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch attendance for search');

      const data = await res.json();

      const latestRecords = {};
      data.forEach((record) => {
        const userId = record.userId?._id;
        if (!userId) return;
        const currentTime = record.loginTime ? new Date(record.loginTime).getTime() : 0;

        if (
          !latestRecords[userId] ||
          (new Date(latestRecords[userId].loginTime).getTime() || 0) < currentTime
        ) {
          latestRecords[userId] = record;
        }
      });

      const uniqueLatestRecords = Object.values(latestRecords).sort((a, b) => {
        const timeA = a.loginTime ? new Date(a.loginTime).getTime() : 0;
        const timeB = b.loginTime ? new Date(b.loginTime).getTime() : 0;
        return timeB - timeA;
      });

      setAttendanceData(uniqueLatestRecords);
    } catch (err) {
      setError(err.message);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAttendanceHistory = async (userId, userName) => {
    if (showFullAttendance && selectedUserName.trim() === userName.trim()) {
      setShowFullAttendance(false);
      setUserFullAttendance([]);
      setSelectedUserName('');
      setCurrentPage(1);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/attendance/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch full attendance');

      const data = await res.json();

      setUserFullAttendance(
        data.sort((a, b) => {
          const timeA = a.loginTime ? new Date(a.loginTime).getTime() : 0;
          const timeB = b.loginTime ? new Date(b.loginTime).getTime() : 0;
          return timeB - timeA;
        })
      );
      setSelectedUserName(userName);
      setShowFullAttendance(true);
      setCurrentPage(1);
    } catch (err) {
      alert(err.message);
    }
  };

  const totalPages = Math.ceil(userFullAttendance.length / RECORDS_PER_PAGE);
  const startIdx = (currentPage - 1) * RECORDS_PER_PAGE;
  const currentRecords = userFullAttendance.slice(startIdx, startIdx + RECORDS_PER_PAGE);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const cellStyle = {
    padding: '8px',
    border: '1px solid #ccc',
    textAlign: 'center',
  };

  // Helper for hover styles on inline buttons
  const handleMouseOver = (e, bgColor) => {
    e.target.style.backgroundColor = bgColor;
  };
  const handleMouseOut = (e, bgColor) => {
    e.target.style.backgroundColor = bgColor;
  };

  return (
    <div>
      <h2 style={{ textAlign: 'left' }}>
        Today's Employee Attendance - {todayDate}
      </h2>

      {/* Search Inputs */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ marginRight: '10px' }}>
          Date:{' '}
          <input
            type="date"
            value={searchDate}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => {
              setError('');
              setSearchDate(e.target.value);
            }}
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
        <button
          onClick={handleSearch}
          style={{ 
            ...buttonBaseStyle,
            backgroundColor: colors.blue,
          }}
          onMouseOver={(e) => handleMouseOver(e, colors.blueHover)}
          onMouseOut={(e) => handleMouseOut(e, colors.blue)}
        >
          Search
        </button>
        <button
          onClick={() => {
            setSearchDate('');
            setSearchEmail('');
            setError('');
            setShowFullAttendance(false);
            setSelectedUserName('');
            fetchAttendanceToday();
          }}
          style={{
            ...buttonBaseStyle,
            backgroundColor: colors.gray,
          }}
          onMouseOver={(e) => handleMouseOver(e, colors.grayHover)}
          onMouseOut={(e) => handleMouseOut(e, colors.gray)}
        >
          Reset
        </button>
      </div>

      {loading && (
        <p aria-live="polite" style={{ textAlign: 'center', padding: '10px' }}>
          Loading attendance data...
        </p>
      )}
      {error && (
        <p aria-live="polite" style={{ color: 'red', textAlign: 'center' }}>
          {error}
        </p>
      )}

      {!loading && !error && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={cellStyle}>Name</th>
                <th style={cellStyle}>Email</th>
                <th style={cellStyle}>Login Time</th>
                <th style={cellStyle}>Logout Time</th>
                <th style={cellStyle}>All Attendance</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ ...cellStyle, textAlign: 'center' }}>
                    No attendance records found.
                  </td>
                </tr>
              )}
              {attendanceData.map((record) =>
                record.userId ? (
                  <tr key={record._id || Math.random()}>
                    <td style={cellStyle}>{record.userId.name || 'N/A'}</td>
                    <td style={cellStyle}>{record.userId.email || 'N/A'}</td>
                    <td style={cellStyle}>
                      {record.loginTime ? new Date(record.loginTime).toLocaleTimeString() : '-'}
                    </td>
                    <td style={cellStyle}>
                      {record.logoutTime ? new Date(record.logoutTime).toLocaleTimeString() : '-'}
                    </td>
                    <td style={cellStyle}>
                      <button
                        style={{
                          ...buttonBaseStyle,
                          backgroundColor:
                            showFullAttendance && selectedUserName.trim() === record.userId.name.trim()
                              ? colors.orange
                              : colors.green,
                          padding: '5px 10px',
                          margin: 0,
                          fontWeight: '600',
                        }}
                        onMouseOver={(e) =>
                          handleMouseOver(
                            e,
                            showFullAttendance && selectedUserName.trim() === record.userId.name.trim()
                              ? colors.orangeHover
                              : colors.greenHover
                          )
                        }
                        onMouseOut={(e) =>
                          handleMouseOut(
                            e,
                            showFullAttendance && selectedUserName.trim() === record.userId.name.trim()
                              ? colors.orange
                              : colors.green
                          )
                        }
                        onClick={() => fetchUserAttendanceHistory(record.userId._id, record.userId.name)}
                      >
                        {showFullAttendance && selectedUserName.trim() === record.userId.name.trim()
                          ? 'Hide'
                          : 'View'}
                      </button>
                    </td>
                  </tr>
                ) : null
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Full Attendance Section with Pagination */}
      {showFullAttendance && (
        <div style={{ marginTop: '20px' }}>
          <h3>
            Full Attendance for: <span style={{ color: colors.green }}>{selectedUserName}</span>
          </h3>
          {currentRecords.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9f9f9' }}>
                    <th style={cellStyle}>Date</th>
                    <th style={cellStyle}>Login Time</th>
                    <th style={cellStyle}>Logout Time</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((entry, idx) => (
                    <tr key={idx}>
                      <td style={cellStyle}>
                        {entry.loginTime ? new Date(entry.loginTime).toLocaleDateString() : '-'}
                      </td>
                      <td style={cellStyle}>
                        {entry.loginTime ? new Date(entry.loginTime).toLocaleTimeString() : '-'}
                      </td>
                      <td style={cellStyle}>
                        {entry.logoutTime ? new Date(entry.logoutTime).toLocaleTimeString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination Controls */}
              <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  style={{
                    ...buttonBaseStyle,
                    backgroundColor: currentPage === 1 ? colors.disabled : colors.blue,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    marginRight: '10px',
                  }}
                  onMouseOver={(e) => {
                    if (currentPage !== 1) handleMouseOver(e, colors.blueHover);
                  }}
                  onMouseOut={(e) => {
                    if (currentPage !== 1) handleMouseOut(e, colors.blue);
                  }}
                >
                  Prev
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  style={{
                    ...buttonBaseStyle,
                    backgroundColor: currentPage === totalPages ? colors.disabled : colors.blue,
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    marginLeft: '10px',
                  }}
                  onMouseOver={(e) => {
                    if (currentPage !== totalPages) handleMouseOver(e, colors.blueHover);
                  }}
                  onMouseOut={(e) => {
                    if (currentPage !== totalPages) handleMouseOut(e, colors.blue);
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <p>No attendance records found for {selectedUserName}.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendance;
