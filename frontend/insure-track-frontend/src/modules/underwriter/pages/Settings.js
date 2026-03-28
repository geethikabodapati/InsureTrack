import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { getUserProfile, updateUserProfile, getUAuditLogs } from '../../../../src/core/services/api.js';
import { 
  User, CheckCircle, Loader2, Key, History, 
  ChevronLeft, ChevronRight, Lock, Download 
} from 'lucide-react';
import '../styles/underwriter.css';

const Settings = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: '', email: '', role: '', authorityLimit: 500000 });
  
  const [auditLogs, setAuditLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [fetchingLogs, setFetchingLogs] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const getUsernameFromStorage = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        return userObj.username || 'UNDERWRITER';
      }
    } catch (e) {
      console.error("Error parsing user from storage", e);
    }
    return 'System';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getUserProfile();
        setProfile({
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
          authorityLimit: response.data.authorityLimit || 500000
        });
      } catch (error) {
        console.error("Sync failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      await updateUserProfile({ fullName: profile.name });
      setMessage({ type: 'success', text: 'Profile updated!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Update failed.' });
    } finally {
      setSaving(false);
    }
  };

  const fetchAuditData = async (page = 0) => {
    setFetchingLogs(true);
    try {
      const res = await getUAuditLogs(page, 10);
      setAuditLogs(res.data.content || []); 
      setTotalPages(res.data.totalPages || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error("Could not fetch audit logs", err);
    } finally {
      setFetchingLogs(false);
    }
  };

  const handleToggleLogs = () => {
    if (!showLogs) fetchAuditData(0);
    setShowLogs(!showLogs);
  };

  const handleExportExcel = () => {
    if (auditLogs.length === 0) {
      alert("No data to export. Please load logs first.");
      return;
    }

    const dataToExport = auditLogs.map(log => ({
      "User": getUsernameFromStorage(),
      "Action Performed": log.action,
      "Source System": log.source || 'Web Browser',
      "Timestamp": new Date(log.timestamp).toLocaleString(),
      "Status": "SUCCESS"
    }));


    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "AuditTrail");


    XLSX.writeFile(wb, `Underwriter_Audit_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) return <div className="loader"><Loader2 className="spin" /> Syncing...</div>;

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h2>Account Settings</h2>
        <p>Manage your professional identity and security credentials</p>
      </div>

      {message && (
        <div className={`settings-alert ${message.type}`}>
          <CheckCircle size={18} /> {message.text}
        </div>
      )}

      <div className="settings-grid">
        <div className="settings-card">
          <div className="card-header-flex">
            <div className="title-group">
              <h3>Personal Identity</h3>
              <p className="card-subtitle">Update your display name</p>
            </div>
            <div className="icon-wrapper bg-blue-soft">
              <User size={20} className="text-blue" />
            </div>
          </div>
          
          <div className="settings-form">
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Designation</label>
              <input type="text" value={profile.role} disabled className="readonly-input" />
            </div>
            <div className="form-actions-right">
              <button className="save-btn" onClick={handleUpdateProfile} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <div className="card-header-flex">
            <div className="title-group">
              <h3>Security & Access</h3>
              <p className="card-subtitle">Manage login credentials</p>
            </div>
            <div className="icon-wrapper bg-green-soft">
              <Lock size={20} className="text-green" />
            </div>
          </div>
          
          <div className="security-credentials-zone">
            <div className="credential-actions">
              <button className="outline-btn" onClick={() => navigate('/reset-password')}>
                <Key size={16} /> Change Password
              </button>
            </div>
          </div>
        </div>

        <div className="settings-card full-width full-bleed-card">
          <div className="card-header-flex align-center">
            <div className="title-group">
              <h3>System Audit Trail</h3>
            </div>
            <div className="header-right-actions" style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="outline-btn export-btn" 
                onClick={handleExportExcel}
                disabled={auditLogs.length === 0}
                title="Download as Excel"
              >
                <Download size={16} /> Export Excel
              </button>

              <button className="outline-btn log-toggle-btn" onClick={handleToggleLogs}>
                {showLogs ? 'Hide History' : 'View Full Logs'}
              </button>
              
              <div className="icon-wrapper bg-indigo-soft">
                <History size={20} className="text-indigo" />
              </div>
            </div>
          </div>

          {showLogs && (
            <div className="audit-log-section slide-down">
              <div className={`table-container ${fetchingLogs ? 'opacity-50' : ''}`}>
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Event Description</th>
                      <th>Source</th>
                      <th>Timestamp</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.length > 0 ? (
                      auditLogs.map((log, i) => (
                        <tr key={i}>
                          <td><strong>{getUsernameFromStorage()}</strong></td>
                          <td>{log.action}</td>
                          <td><span className="source-tag">{log.source || 'Web Browser'}</span></td>
                          <td>{new Date(log.timestamp).toLocaleString()}</td>
                          <td><span className="log-success">Success</span></td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="5" className="text-center">No activity found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="pagination-bar">
                  <button 
                    disabled={currentPage === 0 || fetchingLogs} 
                    onClick={() => fetchAuditData(currentPage - 1)} 
                    className="p-btn"
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <span className="p-info">{`Page ${currentPage + 1} of ${totalPages}`}</span>
                  <button 
                    disabled={currentPage + 1 >= totalPages || fetchingLogs} 
                    onClick={() => fetchAuditData(currentPage + 1)} 
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