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

    // --- FETCH USER ON LOAD ---
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            // Ensure we set the name and email from the logged-in session
            setUserData({
                name: parsedUser.name || '',
                email: parsedUser.email || ''
            });
        }
    }, []);

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert("New passwords do not match!");
            return;
        }
        try {
            // Updated to use the state's email
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

    const handleProfileUpdate = async () => {
        try {
            // 1. Update the database (adjust URL/method based on your API)
            // Assuming an endpoint like /api/users/update-profile
            await axios.put('http://localhost:8080/api/users/update-name', {
                email: userData.email,
                name: userData.name
            });

            // 2. Update Local Storage so the UI reflects the change globally
            const storedUser = JSON.parse(localStorage.getItem("user"));
            const updatedUser = { ...storedUser, name: userData.name };
            localStorage.setItem("user", JSON.stringify(updatedUser));

            alert("Profile updated in database!");
            
            // Optional: Dispatch a storage event if other components need to know
            window.location.reload(); 
        } catch (error) {
            alert(error.response?.data?.message || "Error updating profile in database.");
        }
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
                        <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Full Name</label>
                        <input 
                            type="text" 
                            className="search-input-field" 
                            style={{ width: '100%', marginBottom: '15px', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }} 
                            value={userData.name}
                            onChange={(e) => setUserData({...userData, name: e.target.value})}
                        />
                        <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Email Address (Read-Only)</label>
                        <input 
                            type="email" 
                            className="search-input-field" 
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }} 
                            value={userData.email}
                            disabled // Strictly disabled
                            readOnly 
                        />
                    </div>
                    <button className="add-btn" onClick={handleProfileUpdate} style={{ marginTop: '20px', width: '100%', justifyContent: 'center' }}>
                        Update Database Profile
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
                            <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Current Password</label>
                            <input 
                                type="password" required className="search-input-field" style={{ width: '100%', marginBottom: '10px', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }} 
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                            />
                            <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>New Password</label>
                            <input 
                                type="password" required className="search-input-field" style={{ width: '100%', marginBottom: '10px', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }} 
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                            />
                            <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Confirm New Password</label>
                            <input 
                                type="password" required className="search-input-field" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }} 
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                            />
                        </div>
                        <button type="submit" className="add-btn" style={{ marginTop: '20px', width: '100%', justifyContent: 'center', backgroundColor: '#ef4444' }}>
                            Update Database Password
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;