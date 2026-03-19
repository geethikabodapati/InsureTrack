import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUserProfile, updateUserProfile, getUAuditLogs } from '../../../../src/core/services/api.js';
import { User, Shield, Moon, Sun, CheckCircle, Loader2, Key, History, ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/underwriter.css';

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState({ name: '', email: '', role: '', department: '' });
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  
  // Pagination States
  const [auditLogs, setAuditLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getUserProfile();
        setProfile({
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
          department: response.data.department
        });
        applyTheme(isDarkMode);
      } catch (error) {
        console.error("Real-time sync failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const applyTheme = (dark) => {
    const theme = dark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    applyTheme(newMode);
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      await updateUserProfile({ fullName: profile.name });
      setMessage({ type: 'success', text: 'Profile updated in real-time!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Update failed.' });
    } finally {
      setSaving(false);
    }
  };

  /**
   * UPDATED: handleViewHistory with Pagination
   */
  const handleViewHistory = async (page = 0) => {
    try {
      if (showLogs && page === currentPage) {
        setShowLogs(false);
        return;
      }

      const res = await getUAuditLogs(page, 10);
      setAuditLogs(res.data.content || []); 
      setTotalPages(res.data.totalPages || 0);
      setCurrentPage(page);
      setShowLogs(true);
    } catch (err) {
      console.error("Could not fetch audit logs", err);
    }
  };

  const handlePasswordChange = () => {
    const token = localStorage.getItem('token');
    const returnPath = encodeURIComponent(location.pathname);
    navigate(`/reset-password?token=${token}&returnTo=${returnPath}`);
  };

  if (loading) return <div className="loader"><Loader2 className="spin" /> Syncing with Server...</div>;

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h2>Account Settings</h2>
        <p>Authenticated as <strong>{profile.email}</strong></p>
      </div>

      {message && (
        <div className={`settings-alert ${message.type}`}>
          <CheckCircle size={18} /> {message.text}
        </div>
      )}

      <div className="settings-grid">
        <div className="settings-card">
          <div className="card-title-icon"><User size={20} color="#3b82f6" /><h3>Profile</h3></div>
          <div className="settings-form">
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Email (Read-only)</label>
              <input type="text" value={profile.email} disabled className="readonly-input" />
            </div>
            <button className="save-btn" onClick={handleUpdateProfile} disabled={saving}>
              {saving ? 'Syncing...' : 'Update Details'}
            </button>
          </div>
        </div>

        <div className="settings-card">
          <div className="card-title-icon">
            {isDarkMode ? <Moon size={20} color="#8b5cf6" /> : <Sun size={20} color="#f59e0b" />}
            <h3>Interface</h3>
          </div>
          <div className="toggle-item">
            <div><h4>Dark Mode</h4><p>Adjust visual preference</p></div>
            <label className="switch">
              <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        <div className="settings-card security-card">
          <div className="card-title-icon"><Shield size={20} color="#10b981" /><h3>Security</h3></div>
          <div className="security-actions">
            <button className="outline-btn" onClick={handlePasswordChange}>
              <Key size={16} /> Change Password
            </button>
            <button className="outline-btn" onClick={() => handleViewHistory(0)}>
              <History size={16} /> {showLogs ? 'Hide History' : 'View Audit Logs'}
            </button>
          </div>

          {showLogs && (
            <div className="audit-log-section">
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>Event Description</th>
                    <th>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length > 0 ? (
                    auditLogs.map((log, i) => (
                      <tr key={i}>
                        <td>{log.action}</td>
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="2" style={{textAlign: 'center'}}>No logs found.</td></tr>
                  )}
                </tbody>
              </table>

              {/* PAGINATION CONTROLS */}
              {totalPages > 1 && (
                <div className="pagination-bar">
                  <button 
                    disabled={currentPage === 0} 
                    onClick={() => handleViewHistory(currentPage - 1)}
                    className="p-btn"
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>
                  
                  <span className="p-info">
                    Page <strong>{currentPage + 1}</strong> of {totalPages}
                  </span>

                  <button 
                    disabled={currentPage + 1 >= totalPages} 
                    onClick={() => handleViewHistory(currentPage + 1)}
                    className="p-btn"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;