import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { register } from '../../../core/services/api';
import '../../user/styles/user.css';

const RegisterUser = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', password: '', confirmPassword: '', role: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const validate = () => {
        let tempErrors = {};
        
        // Name validation (Not null or just whitespace)
        if (!formData.name || formData.name.trim().length === 0) {
            tempErrors.name = "Full Name is required";
        }

        // Gmail only validation
        if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(formData.email)) {
            tempErrors.email = "Only @gmail.com addresses are allowed";
        }

        // Indian Phone Number validation
        if (!/^[6-9]\d{9}$/.test(formData.phone)) {
            tempErrors.phone = "Enter a valid 10-digit phone number";
        }

        /** * Password Regex Validation:
         * - At least 8 characters
         * - At least one uppercase letter
         * - At least one number
         * - At least one special character (@$!%*?&)
         */
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            tempErrors.password = "Password must be 8+ chars with 1 uppercase, 1 number, and 1 special char";
        }

        if (formData.password !== formData.confirmPassword) {
            tempErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const { confirmPassword, ...data } = formData;
            await register(data);
            navigate('/auth/login');
        } catch (err) {
            setErrors({ api: "Registration failed. Please try again." });
        }
    };

    return (
        <div className="auth-container">
            <div className="form-pane">
                <div className="auth-card" style={{maxWidth: '480px'}}>
                    <div className="card-header">
                        <div className="icon-circle"><UserPlus className="text-blue-600" size={32} /></div>
                        <h2 className="text-2xl font-bold">Create Account</h2>
                        <p className="text-gray-500 text-sm">Register for insurance system access</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Full Name</label>
                            <input type="text" placeholder="Enter your full name" 
                                onChange={e => setFormData({...formData, name: e.target.value})} required />
                        </div>

                        <div className="input-group">
                            <label>Role</label>
                            <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} required>
                                <option value="">Select your role</option>
                                <option value="customer">Customer</option>
                                <option value="agent">Agent</option>
                                <option value="admin">Admin</option>
                            </select>
                            {errors.role && <p className="error-msg">{errors.role}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                            <div className="input-group">
                                <label>Gmail Address</label>
                                <input type="email" placeholder="example@gmail.com" 
                                    onChange={e => setFormData({...formData, email: e.target.value})} required />
                                {errors.email && <p className="error-msg">{errors.email}</p>}
                            </div>
                            <div className="input-group">
                                <label>Phone Number</label>
                                <input type="text" maxLength="10" placeholder="9876543210" 
                                    onChange={e => setFormData({...formData, phone: e.target.value})} required />
                                {errors.phone && <p className="error-msg">{errors.phone}</p>}
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <div className="password-wrapper">
                                <input type={showPassword ? "text" : "password"} placeholder="••••••••" 
                                    onChange={e => setFormData({...formData, password: e.target.value})} required />
                                <button type="button" className="eye-toggle" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && <p className="error-msg">{errors.password}</p>}
                        </div>

                        <div className="input-group">
                            <label>Confirm Password</label>
                            <input type="password" placeholder="••••••••" 
                                onChange={e => setFormData({...formData, confirmPassword: e.target.value})} required />
                            {errors.confirmPassword && <p className="error-msg">{errors.confirmPassword}</p>}
                        </div>

                        <button type="submit" className="btn-submit">Register</button>
                    </form>

                    <p className="mt-6 text-center text-sm">
                        Already have an account? <Link to="/auth/login" className="text-blue-600 font-bold hover:underline">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterUser;