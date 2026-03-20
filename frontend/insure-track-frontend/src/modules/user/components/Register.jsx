import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from "lucide-react";
import { register } from '../../../services/api';
import '../../../styles/user.css';

const Register = () => {
    const [formData, setFormData] = useState({ name:'', email:'', phone:'', password:'', confirmPassword:'', role:'CUSTOMER' });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const validate = () => {
        let e = {};
        if (!formData.name?.trim()) e.name = "Full Name is required";
        if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(formData.email)) e.email = "Only @gmail.com addresses are allowed";
        if (!/^[6-9]\d{9}$/.test(formData.phone)) e.phone = "Enter a valid 10-digit phone number";
        if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password))
            e.password = "Password must be 8+ chars with 1 uppercase, 1 number, 1 special char";
        if (formData.password !== formData.confirmPassword) e.confirmPassword = "Passwords do not match";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        if (!validate()) return;
        try {
            const { confirmPassword, ...data } = formData;
            await register(data);
            navigate('/login');
        } catch (err) {
            setErrors({ api: err.response?.data?.message || "Registration failed." });
        }
    };

    return (
        <div className="auth-container">
            <div className="info-pane">
                <div className="brand-badge">InsureTrack</div>
                <div className="info-content">
                    <h1>Enterprise Insurance Management System</h1>
                    <p>Streamline your insurance operations with our comprehensive platform.</p>
                    <div className="hero-image"></div>
                    <div className="stats-row">
                        <div className="stat-item"><h3>10K+</h3><p>Active Users</p></div>
                        <div className="stat-item"><h3>99.9%</h3><p>Uptime</p></div>
                        <div className="stat-item"><h3>24/7</h3><p>Support</p></div>
                    </div>
                </div>
            </div>
            <div className="form-pane">
                <div className="auth-card" style={{maxWidth:'480px'}}>
                    <div className="card-header">
                        <div className="icon-circle"><UserPlus color='blue' size={25} /></div>
                        <h2 className="text-4xl font-bold">Create Account</h2>
                        <p className="text-gray-500 text-sm">Register for insurance system access</p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Full Name</label>
                            <input type="text" placeholder="Enter your full name"
                                className={errors.name ? "input-error" : ""}
                                onChange={e => setFormData({...formData, name: e.target.value})} required />
                            {errors.name && <p className="error-msg">{errors.name}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                            <div className="input-group">
                                <label>Email</label>
                                <input type="email" placeholder="Enter your email"
                                    className={errors.email ? "input-error" : ""}
                                    onChange={e => setFormData({...formData, email: e.target.value})} required />
                                {errors.email && <p className="error-msg">{errors.email}</p>}
                            </div>
                            <div className="input-group">
                                <label>Phone Number</label>
                                <input type="text" maxLength="10" placeholder="Enter your phone number"
                                    className={errors.phone ? "input-error" : ""}
                                    onChange={e => setFormData({...formData, phone: e.target.value})} required />
                                {errors.phone && <p className="error-msg">{errors.phone}</p>}
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Password</label>
                            <input type="password" placeholder="Create your password"
                                className={errors.password ? "input-error" : ""}
                                onChange={e => setFormData({...formData, password: e.target.value})} required />
                            {errors.password && <p className="error-msg">{errors.password}</p>}
                        </div>
                        <div className="input-group">
                            <label>Confirm Password</label>
                            <input type="password" placeholder="Confirm your password"
                                className={errors.confirmPassword ? "input-error" : ""}
                                onChange={e => setFormData({...formData, confirmPassword: e.target.value})} required />
                            {errors.confirmPassword && <p className="error-msg">{errors.confirmPassword}</p>}
                        </div>
                        <button type="submit" className="btn-submit">Register</button>
                        {errors.api && <p className="error-msg text-center mt-3">{errors.api}</p>}
                    </form>
                    <p className="mt-6 text-center text-sm">
                        Already have an account? <Link to="/login" className="forgot-link">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
export default Register;
