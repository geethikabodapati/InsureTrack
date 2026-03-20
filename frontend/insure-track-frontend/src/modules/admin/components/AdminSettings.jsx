import React, { useState, useEffect } from 'react';
import { User, Lock, Monitor, Bell } from 'lucide-react';
import axios from 'axios';
import '../styles/AdminTables.css';
 
const AdminSettings = () => {
    const [userData, setUserData] = useState({ name: '', email: '' });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
 
    // Default to 'Dark' as you want everything black
    const [theme, setTheme] = useState(localStorage.getItem('appTheme') || 'Dark');
 
    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (stored) {
            const parsed = JSON.parse(stored);
            setUserData({
                name: parsed.name || parsed.username || 'Admin1',
                email: parsed.email || 'admin213@gmail.com'
            });
        }
        // Apply theme to the root element immediately
        document.documentElement.setAttribute('data-theme', theme.toLowerCase());
    }, [theme]);
 
    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('appTheme', newTheme);
    };
 
    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert("New passwords do not match!");
            return;
        }
        try {
            // Replace with your backend URL
            await axios.post('http://localhost:8080/api/users/change-password', {
                email: userData.email,
                oldPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            alert("Password updated successfully!");
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            alert(error.response?.data?.message || "Error updating password.");
        }
    };
 
    const handleProfileUpdate = () => {
        const updatedUser = { ...JSON.parse(localStorage.getItem("user")), name: userData.name };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        alert("Name updated!");
        window.location.reload();
    };
 
    return (
        <div className="table-container">
            <div className="table-header-section">
                <div className="table-title">
                    <h1 style={{ color: 'var(--text-main)' }}>Settings</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage your profile and security preferences</p>
                </div>
            </div>
 
            <div className="settings-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '20px',
                marginTop: '20px'
            }}>
               
                {/* PROFILE SECTION */}
                <div className="table-card" style={{ padding: '24px', backgroundColor: 'var(--card-bg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <User size={22} color="#3b82f6" />
                        <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Profile Information</h3>
                    </div>
                    <div className="form-group">
                        <label style={{ color: 'var(--text-muted)' }}>Full Name</label>
                        <input
                            type="text"
                            className="search-input-field"
                            style={{ width: '100%', marginBottom: '15px' }}
                            value={userData.name}
                            onChange={(e) => setUserData({...userData, name: e.target.value})}
                        />
                        <label style={{ color: 'var(--text-muted)' }}>Email Address (Read-Only)</label>
                        <input
                            type="email"
                            className="search-input-field"
                            style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed' }}
                            value={userData.email}
                            readOnly
                        />
                    </div>
                    <button className="add-btn" onClick={handleProfileUpdate} style={{ marginTop: '20px', width: '100%', justifyContent: 'center' }}>
                        Save Name Changes
                    </button>
                </div>
 
                {/* SECURITY SECTION */}
                <div className="table-card" style={{ padding: '24px', backgroundColor: 'var(--card-bg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <Lock size={22} color="#ef4444" />
                        <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Change Password</h3>
                    </div>
                    <form onSubmit={handlePasswordUpdate}>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)' }}>Current Password</label>
                            <input
                                type="password" required className="search-input-field" style={{ width: '100%', marginBottom: '10px' }}
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                            />
                            <label style={{ color: 'var(--text-muted)' }}>New Password</label>
                            <input
                                type="password" required className="search-input-field" style={{ width: '100%', marginBottom: '10px' }}
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                            />
                            <label style={{ color: 'var(--text-muted)' }}>Confirm New Password</label>
                            <input
                                type="password" required className="search-input-field" style={{ width: '100%' }}
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                            />
                        </div>
                        <button type="submit" className="add-btn" style={{ marginTop: '20px', width: '100%', justifyContent: 'center', backgroundColor: '#ef4444' }}>
                            Update Database
                        </button>
                    </form>
                </div>
 
               
            </div>
        </div>
    );
};
 
export default AdminSettings;