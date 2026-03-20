import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff } from "lucide-react";
import { login } from '../../../services/api';
import '../../../styles/user.css';

const Login = () => {
    const [email, setEmail]             = useState('');
    const [password, setPassword]       = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors]           = useState({});
    const navigate = useNavigate();

    const validateForm = () => {
        let e = {};
        if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) e.email = "Please enter a valid @gmail.com address.";
        if (!/^(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/.test(password)) e.password = "Password must be at least 6 characters with a number.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };
    
    const handleLogin = async (ev) => {
    ev.preventDefault();
    if (!validateForm()) return;
    try {
        const response = await login({ email, password });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.role);
        localStorage.setItem('user', JSON.stringify(response.data));

        // FIX: Match these to your new router paths!
        if (response.data.role === 'ADJUSTER') {
            navigate("/adjuster"); // Navigate to the specific adjuster path
        } else if (response.data.role === 'ADMIN') {
            navigate("/admin");    // Navigate to the specific admin path
        } else {
            setErrors({ api: "Unauthorized role." });
        }
    } catch (error) {
        setErrors({ api: error.response?.data?.message || "Invalid Credentials" });
    }
};

    return (
        <div className="auth-container">
            <div className="info-pane">
                <div className="brand-badge">InsureTrack</div>
                <div className="info-content">
                    <h1>Enterprise Insurance Management System</h1>
                    <p>Streamline your insurance operations with our comprehensive platform. Manage policies, claims, and customer relationships all in one place.</p>
                    <div className="hero-image"></div>
                </div>
                <div className="stats-row">
                    <div className="stat-item"><h3>10K+</h3><p>Active Users</p></div>
                    <div className="stat-item"><h3>99.9%</h3><p>Uptime</p></div>
                    <div className="stat-item"><h3>24/7</h3><p>Support</p></div>
                </div>
            </div>
            <div className="form-pane">
                <div className="auth-card">
                    <div className="card-header">
                        <div className="icon-circle"><Shield color='blue' size={25} /></div>
                        <h2 className="text-2xl font-bold">Welcome Back</h2>
                        <p className="text-gray-500 text-sm">Sign in to your account</p>
                    </div>
                    <form onSubmit={handleLogin}>
                        <div className="input-group">
                            <label>Email</label>
                            <input type="email" placeholder="Enter your email" value={email}
                                onChange={e => setEmail(e.target.value)}
                                className={errors.email ? "input-error" : ""} required />
                            {errors.email && <p className="error-msg text-xs mt-1">{errors.email}</p>}
                        </div>
                        <div className="input-group">
                            <label>Password</label>
                            <div className="password-wrapper">
                                <input type={showPassword ? "text" : "password"} placeholder="Enter your password"
                                    value={password} onChange={e => setPassword(e.target.value)}
                                    className={errors.password ? "input-error" : ""} required />
                                <button type="button" className="eye-toggle" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.password && <p className="error-msg text-xs mt-1">{errors.password}</p>}
                        </div>
                        <div className="form-options">
                            <label className="remember-me">
                                <input type="checkbox" className="w-4 h-4" />
                                <span className="text-gray-600">Remember me</span>
                            </label>
                            <a href="/forgot-password" className="forgot-link">Forgot password?</a>
                        </div>
                        <button type="submit" className="btn-submit">Sign In</button>
                        {errors.api && <p className="error-msg text-center mt-3">{errors.api}</p>}
                    </form>
                    <p className="mt-6 text-center text-sm text-gray-600">
                        Don't have an account? <a href="/register" className="forgot-link">Create account</a>
                    </p>
                </div>
            </div>
        </div>
    );
};
export default Login;
