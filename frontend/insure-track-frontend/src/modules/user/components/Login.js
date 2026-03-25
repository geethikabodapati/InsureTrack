import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Eye, EyeOff } from "lucide-react";
import { login } from '../../../core/services/api';
import '../../../styles/user.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const validateForm = () => {
        let tempErrors = {};

        // Email Validation (Standard format)
        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!emailRegex.test(email)) {
            tempErrors.email = "Please enter a valid email address.";
        }

        /** * Password Validation:
         * - At least 1 Uppercase letter (?=.*[A-Z])
         * - At least 1 Number (?=.*\d)
         * - At least 1 Special Character (?=.*[@$!%*?&])
         * - Minimum 8 characters
         */
        const passwordRegex = /^(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
        if (!passwordRegex.test(password)) {
            tempErrors.password = "Password must be at least 6 characters, a number, and a special character.";
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        // Only proceed if client-side validation passes
        if (!validateForm()) return;

        try {
            const response = await login({ email, password });
            //localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role);
            localStorage.setItem('user', JSON.stringify(response.data));
            window.dispatchEvent(new Event("storage"));
            const role = response.data.role;
            if (role === 'ADMIN') navigate('/admin-dashboard');
            else if (role === "CUSTOMER") navigate('/customer-dashboard');
            else if (role === "UNDERWRITER") navigate('/underwriter-dashboard');
            else if (role === "AGENT") navigate('/agent-dashboard');
            else if (role === "ANALYST") navigate('/analyst-dashboard');
            else if (role === "ADJUSTER") navigate('/adjuster-dashboard');
            else navigate('/');
        } catch (error) {
            setErrors({ api: error.response?.data?.message || "Invalid Credentials" });
        }
    };

    return (
        <div className="auth-container">
            <div className="info-pane">
                <div className="brand-badge">InsureTrack</div>
                <div className="info-content">
                    {/* <h1>Enterprise Insurance Management System</h1> */}
                    <p>Streamline your insurance operations with our comprehensive platform. Manage policies, claims, and customer relationships all in one place.</p>
                    <div className="hero-image"></div>
                </div>
                <div className="stats-row">
                    <div className="stat-item"><h3>36</h3><p>Active Users</p></div>
                    <div className="stat-item"><h3>6</h3><p>Active Policies</p></div>
                    <div className="stat-item"><h3>24/7</h3><p>Support</p></div>
                </div>
            </div>

            <div className="form-pane">
                <div className="auth-card">
                    <div className="card-header">
                        <div className="icon-circle">
                            {/* <div className="icon-header">🛡️</div> */}
                            <Shield color='blue' size={25}></Shield>
                        </div>
                        <h2 className="text-2xl font-bold">Welcome Back</h2>
                        <p className="text-gray-500 text-sm">Sign in to your account</p>
                    </div>

                    <form onSubmit={handleLogin}>
                        <div className="input-group">
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={errors.email ? "input-error" : ""}
                                required
                            />
                            {errors.email && <p className="error-msg text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={errors.password ? "input-error" : ""}
                                    required
                                />
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
                            <a href="/forgot-password" size={20} className="forgot-link">Forgot password?</a>
                        </div>

                        <button type="submit" className="btn-submit">Sign In</button>

                        {/* API level error message */}
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