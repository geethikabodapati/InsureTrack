import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import '../../../styles/user.css';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Get parameters from URL
    const token = searchParams.get("token");
    const returnTo = searchParams.get("returnTo"); // e.g., "/underwriter/settings"

    const handleReset = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        try {
            // Note: Ensure the port matches your Auth Service (8082 in your previous snippet)
            const response = await axios.post(`http://localhost:8082/api/auth/reset-password?token=${token}`, {
                email: "", // Not needed if token is valid
                password: password 
            });
            
            if (response.status === 200) {
                alert("Password updated successfully!");
                
                // If returnTo exists, go back to the specific dashboard. 
                // Otherwise (from email link), go to login.
                if (returnTo) {
                    navigate(decodeURIComponent(returnTo));
                } else {
                    navigate('/login');
                }
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Invalid or expired session.";
            setError(errorMessage);
        }
    };

    return (
        <div className="auth-container">
            <div className="form-pane">
                <div className="auth-card">
                    <div className="card-header">
                        <div className="icon-circle">
                            <div className="icon-header">🔒</div>
                        </div>
                        <h2 className="text-2xl font-bold">Create New Password</h2>
                        <p className="text-gray-500 text-sm">Please enter and confirm your new password.</p>
                    </div>

                    <form onSubmit={handleReset}>
                        <div className="input-group">
                            <label>New Password</label>
                            <div className="password-wrapper">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Enter new password" 
                                    value={password}
                                    onChange={e => setPassword(e.target.value)} 
                                    required 
                                />
                                <button type="button" className="eye-toggle" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Confirm New Password</label>
                            <input 
                                type="password" 
                                placeholder="Retype your password" 
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)} 
                                required 
                            />
                        </div>

                        {error && <p className="error-msg" style={{textAlign: 'center', marginBottom: '15px'}}>{error}</p>}

                        <div className="button-group" style={{ display: 'flex', gap: '10px' }}>
                            {returnTo && (
                                <button type="button" className="btn-outline" onClick={() => navigate(-1)} style={{ flex: 1 }}>
                                    Cancel
                                </button>
                            )}
                            <button type="submit" className="btn-submit" style={{ flex: 2 }}>
                                Update Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;