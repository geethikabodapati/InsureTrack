import React, { useEffect, useState } from 'react';
import { getAllUsers, register } from '../../../core/services/api';
import { MoreVertical, Search, UserPlus, ChevronLeft, ChevronRight, Users, UserX, X, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import '../styles/AdminTables.css';
 
const UserList = () => {
    // --- DATA STATES ---
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
 
    // --- PAGINATION STATE ---
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
 
    // --- MODAL & FORM STATE ---
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
 
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: 'Password@123',
        confirmPassword: 'Password@123',
        role: 'AGENT'
    });
 
    const fetchUsers = () => {
        setLoading(true);
        getAllUsers()
            .then(response => {
                const data = Array.isArray(response.data) ? response.data : response;
                setUsers(data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Fetch error:", err);
                setError("Failed to load users from the server.");
                setLoading(false);
            });
    };
 
    useEffect(() => {
        fetchUsers();
    }, []);
 
    // --- HELPERS ---
   
    // Masking function: 9876543210 -> 98******10
    const maskPhone = (phone) => {
        if (!phone || phone.length < 4) return phone || 'N/A';
        const firstTwo = phone.substring(0, 2);
        const lastTwo = phone.substring(phone.length - 2);
        const masking = "*".repeat(phone.length - 4);
        return `${firstTwo}${masking}${lastTwo}`;
    };
 
    const getRoleClass = (role) => {
        if (!role) return 'role-default';
        switch (role.toUpperCase()) {
            case 'ADMIN': return 'role-admin';
            case 'UNDERWRITER': return 'role-underwriter'; // Specific purple/indigo
            case 'ADJUSTER': return 'role-adjuster';       // Specific orange/amber
            case 'ANALYST': return 'role-analyst';         // Specific teal/cyan
            case 'AGENT': return 'role-agent';             // Specific green/emerald
            default: return 'role-default';
        }
    };
 
    // --- FORM HANDLERS ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };
 
    const handleNameKeyDown = (e) => {
        const isAlpha = /^[a-zA-Z\s]*$/.test(e.key);
        const isControl = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key);
        if (!isAlpha && !isControl) {
            e.preventDefault();
        }
    };
 
    const validateForm = () => {
        let newErrors = {};
        if (!/^[a-zA-Z\s]*$/.test(formData.name) || !formData.name.trim()) {
            newErrors.name = "Full Name must contain only alphabets";
        }
        if (!formData.email.toLowerCase().endsWith("@gmail.com")) {
            newErrors.email = "Email must be a valid @gmail.com address";
        }
        if (!/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = "Phone number must be exactly 10 digits";
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match!";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
 
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
 
        setIsSubmitting(true);
        try {
            const requestData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                role: formData.role
            };
 
            await register(requestData);
            alert("Account Created Successfully!");
            setShowModal(false);
            setFormData({
                name: '', email: '', phone: '',
                password: 'Password@123', confirmPassword: 'Password@123',
                role: 'AGENT'
            });
            setErrors({});
            fetchUsers();
        } catch (err) {
            console.error("Registration error:", err);
            alert(err.response?.data?.message || "Failed to create user. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };
 
    // --- TABLE LOGIC ---
    const filteredUsers = users.filter(user => {
        const term = searchTerm.toLowerCase();
        return (
            user.name?.toLowerCase().includes(term) ||
            user.email?.toLowerCase().includes(term) ||
            user.role?.toLowerCase().includes(term)
        );
    });
 
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredUsers.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
 
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };
 
    const getPaginationGroup = () => {
        let start = Math.floor((currentPage - 1) / 5) * 5;
        return new Array(Math.min(5, totalPages - start)).fill().map((_, idx) => start + idx + 1);
    };
 
    const errorTextStyle = { color: '#ef4444', fontSize: '11px', marginTop: '4px', fontWeight: '500' };
 
    return (
        <div className="table-container">
            <div className="table-header-section">
                <div className="table-title">
                    <h1>Users</h1>
                    <p>Manage user accounts and system permissions</p>
                </div>
                <button className="add-btn" onClick={() => setShowModal(true)}>
                    <UserPlus size={18} /> Add User
                </button>
            </div>
 
            {showModal && (
                <div className="modal-overlay" style={modalOverlayStyle}>
                    <div className="modal-card" style={modalCardStyle}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div>
                                <h2 style={{ margin: 0, color: '#1e293b' }}>Create Account</h2>
                                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>Register for insurance system access</p>
                            </div>
                            <button onClick={() => { setShowModal(false); setErrors({}); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                <X size={24} />
                            </button>
                        </div>
 
                        <form onSubmit={handleFormSubmit} noValidate>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="form-group">
                                    <label style={labelStyle}>Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        onKeyDown={handleNameKeyDown}
                                        placeholder="John Doe"
                                        style={inputStyle}
                                    />
                                    {errors.name && <div style={errorTextStyle}>{errors.name}</div>}
                                </div>
                                <div className="form-group">
                                    <label style={labelStyle}>Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="john@gmail.com" style={inputStyle} />
                                    {errors.email && <div style={errorTextStyle}>{errors.email}</div>}
                                </div>
                                <div className="form-group">
                                    <label style={labelStyle}>Phone Number</label>
                                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="10 Digit Mobile" style={inputStyle} />
                                    {errors.phone && <div style={errorTextStyle}>{errors.phone}</div>}
                                </div>
                                <div className="form-group">
                                    <label style={labelStyle}>Assign Role</label>
                                    <select name="role" value={formData.role} onChange={handleInputChange} style={inputStyle}>
                                        <option value="AGENT">AGENT</option>
                                        <option value="UNDERWRITER">UNDERWRITER</option>
                                        <option value="ADJUSTER">ADJUSTER</option>
                                        <option value="ANALYST">ANALYST</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label style={labelStyle}>Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            style={inputStyle}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label style={labelStyle}>Confirm Password</label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        style={inputStyle}
                                    />
                                    {errors.confirmPassword && <div style={errorTextStyle}>{errors.confirmPassword}</div>}
                                </div>
                            </div>
 
                            <div style={{ marginTop: '30px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => { setShowModal(false); setErrors({}); }} style={cancelBtnStyle}>Cancel</button>
                                <button type="submit" disabled={isSubmitting} style={submitBtnStyle}>
                                    {isSubmitting ? "Processing..." : "Create Account"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
 
            <div className="table-card">
                <div className="table-controls-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px' }}>
                    <div className="search-wrapper" style={{ width: '300px', position: 'relative' }}>
                        <Search className="search-icon" size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="search-input-field"
                            style={{ paddingLeft: '35px', width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
 
                    <div className="page-length" style={{ color: '#64748b', fontSize: '14px' }}>
                        Show
                        <select
                            value={rowsPerPage}
                            onChange={(e) => {setRowsPerPage(Number(e.target.value)); setCurrentPage(1);}}
                            style={{ margin: '0 8px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                        </select>
                        entries
                    </div>
                </div>
 
                {loading ? (
                    <div style={{padding: '60px', textAlign: 'center', color: '#64748b'}}>
                        <div className="spinner">Loading...</div>
                    </div>
                ) : (
                    <>
                        {filteredUsers.length === 0 ? (
                            <div style={{ padding: '80px 40px', textAlign: 'center' }}>
                                <UserX size={48} style={{ margin: '0 auto 16px', color: '#cbd5e1' }} />
                                <h3 style={{ color: '#1e293b' }}>No matches found</h3>
                                <button onClick={() => setSearchTerm("")} style={{ marginTop: '16px', cursor: 'pointer' }}>Clear Search</button>
                            </div>
                        ) : (
                            <>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Phone</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentRows.map((user) => (
                                            <tr key={user.userId}>
                                                <td style={{ fontWeight: '500', color: '#1e293b' }}>{user.name}</td>
                                                <td>{user.email}</td>
                                                <td>
                                                    <span className={`status-badge ${getRoleClass(user.role)}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                {/* Phone number is masked for security */}
                                                <td style={{ color: '#64748b', letterSpacing: '1px' }}>
                                                    {maskPhone(user.phone)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
 
                                <div className="table-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderTop: '1px solid #f1f5f9' }}>
                                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                                        Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, filteredUsers.length)} of {filteredUsers.length} entries
                                    </div>
 
                                    <div className="pagination-controls" style={{ display: 'flex', gap: '5px' }}>
                                        <button className="page-nav-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} style={navBtnStyle}>
                                            <ChevronLeft size={16} /> Previous
                                        </button>
                                        {getPaginationGroup().map((item) => (
                                            <button
                                                key={item}
                                                onClick={() => setCurrentPage(item)}
                                                style={{
                                                    ...pageNumStyle,
                                                    backgroundColor: currentPage === item ? '#3b82f6' : 'transparent',
                                                    color: currentPage === item ? '#fff' : '#64748b',
                                                    border: '1px solid #e2e8f0'
                                                }}
                                            >
                                                {item}
                                            </button>
                                        ))}
                                        <button className="page-nav-btn" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)} style={navBtnStyle}>
                                            Next <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
 
// --- STYLES ---
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalCardStyle = { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '550px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' };
const labelStyle = { display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600', color: '#475569' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px' };
const submitBtnStyle = { padding: '10px 20px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' };
const cancelBtnStyle = { padding: '10px 20px', backgroundColor: '#fff', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer' };
const navBtnStyle = { display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', cursor: 'pointer', color: '#64748b' };
const pageNumStyle = { minWidth: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px' };
 
export default UserList;
 