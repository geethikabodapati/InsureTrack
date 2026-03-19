import React, { useState } from 'react';
import { forgotPassword } from '../../../core/services/api';
import { Link } from 'react-router-dom';
import { KeyRound, MailCheck, AlertCircle } from "lucide-react"; // npm install lucide-react
import '../../../styles/user.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const validateEmail = (email) => {
        return /^[a-zA-Z._%+-]+@gmail\.com$/.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!validateEmail(email)) {
            setError("Please enter a valid @gmail.com address");
            return;
        }

        try {
            await forgotPassword(email);
            setMessage("Password reset link has been sent to your Gmail.");
        } catch (err) {
            setError(err.response?.data?.message || "User not found with this email.");
        }
    };

    return (
        <div className="auth-container">
            <div className="form-pane">
                <div className="auth-card">
                    <div className="card-header">
                        <div className='icon-header'>
                            🔑
                        </div>
                        <h3 className="text-2xl font-bold">Reset Password</h3>
                        <p className="text-gray-500 text-sm">Enter your Gmail to receive a reset link</p>
                    </div>

                    {message && (
                        <div style={{ 
                            backgroundColor: '#ecfdf5', 
                            color: '#065f46', 
                            padding: '12px', 
                            borderRadius: '8px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            fontSize: '14px',
                            marginBottom: '20px'
                        }}>
                            <MailCheck size={18} /> {message}
                        </div>
                    )}

                    {error && (
                        <div style={{ 
                            backgroundColor: '#fef2f2', 
                            color: '#991b1b', 
                            padding: '12px', 
                            borderRadius: '8px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            fontSize: '14px',
                            marginBottom: '20px'
                        }}>
                            <AlertCircle size={18} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="btn-submit">
                            Send Reset Link
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        Remember your password?{" "}
                        <Link to="/login" className="forgot-link">
                            Back to Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;