import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from "lucide-react";
import '../../../styles/user.css';

const ResetPassword = () => {
    const [password, setPassword]               = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword]       = useState(false);
    const [error, setError]                     = useState('');
    const [searchParams]                        = useSearchParams();
    const navigate                              = useNavigate();
    const token                                 = searchParams.get("token");

    const handleReset = async (e) => {
        e.preventDefault(); setError('');
        if (password !== confirmPassword) { setError("Passwords do not match!"); return; }
        try {
            const r = await axios.post(`http://localhost:8082/api/auth/reset-password?token=${token}`, { email:"", password });
            if (r.status === 200) { alert("Password reset successful!"); navigate('/login'); }
        } catch (err) {
            setError(err.response?.data?.message || "Invalid or expired token.");
        }
    };

    return (
        <div className="auth-container">
            <div className="form-pane">
                <div className="auth-card">
                    <div className="card-header">
                        <div className="icon-header">🔒</div>
                        <h2 className="text-2xl font-bold">Create New Password</h2>
                        <p className="text-gray-500 text-sm">Enter and confirm your new password.</p>
                    </div>
                    <form onSubmit={handleReset}>
                        <div className="input-group">
                            <label>New Password</label>
                            <div className="password-wrapper">
                                <input type={showPassword ? "text" : "password"} placeholder="Enter new password"
                                    value={password} onChange={e => setPassword(e.target.value)} required />
                                <button type="button" className="eye-toggle" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Confirm New Password</label>
                            <input type="password" placeholder="Retype your password"
                                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                        </div>
                        {error && <p className="error-msg" style={{textAlign:'center',marginBottom:'15px'}}>{error}</p>}
                        <button type="submit" className="btn-submit">Update Password</button>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default ResetPassword;
