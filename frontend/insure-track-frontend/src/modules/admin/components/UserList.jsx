import React, { useEffect, useState } from 'react';
import { getAllUsers } from '../../../services/api';
import { MoreVertical, Search, UserPlus, ChevronLeft, ChevronRight, Users, UserX } from 'lucide-react';
import '../styles/AdminTables.css';
 
const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
 
    // --- PAGINATION STATE ---
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
 
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
 
    // 1. Filter logic
    const filteredUsers = users.filter(user => {
        const term = searchTerm.toLowerCase();
        return (
            user.name?.toLowerCase().includes(term) ||
            user.email?.toLowerCase().includes(term) ||
            user.role?.toLowerCase().includes(term)
        );
    });
 
    // 2. Pagination Calculation
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
 
    const getRoleClass = (role) => {
        if (!role) return 'role-default';
        switch (role.toUpperCase()) {
            case 'ADMIN': return 'role-admin';
            case 'MANAGER': return 'role-manager';
            case 'ANALYST': return 'role-analyst';
            case 'CUSTOMER': return 'role-customer';
            case 'AGENT': return 'role-agent';
            default: return 'role-default';
        }
    };
 
    return (
        <div className="table-container">
            <div className="table-header-section">
                <div className="table-title">
                    <h1>Users</h1>
                    <p>Manage user accounts and system permissions</p>
                </div>
                <button className="add-btn">
                    <UserPlus size={18} /> Add User
                </button>
            </div>
 
            <div className="table-card">
                {/* --- HEADER CONTROLS --- */}
                <div className="table-controls-top" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '15px'
                }}>
                    <div className="search-wrapper" style={{ width: '300px', position: 'relative' }}>
                        <Search className="search-icon" size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Search by name, email, or role..."
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
                            style={{ margin: '0 8px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#fff' }}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                        </select>
                        entries
                    </div>
                </div>
 
                {loading ? (
                    <div className="loading-text" style={{padding: '60px', textAlign: 'center', color: '#64748b'}}>
                        <div className="spinner" style={{ marginBottom: '10px' }}>Loading...</div>
                        <p>Fetching user directory...</p>
                    </div>
                ) : error ? (
                    <div className="error-box" style={{ padding: '40px', color: '#ef4444', textAlign: 'center' }}>
                        <p><strong>{error}</strong></p>
                        <button onClick={fetchUsers} style={{ marginTop: '10px', background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline' }}>Try again</button>
                    </div>
                ) : (
                    <>
                        {/* CASE 1: No users in database at all */}
                        {users.length === 0 ? (
                            <div className="empty-state" style={{ padding: '80px 40px', textAlign: 'center' }}>
                                <Users size={48} style={{ margin: '0 auto 16px', color: '#cbd5e1' }} />
                                <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>No users found</h3>
                                <p style={{ color: '#64748b' }}>Your user directory is currently empty. Start by adding a new user.</p>
                            </div>
                        ) :
                        /* CASE 2: Users exist, but search filter returned nothing */
                        filteredUsers.length === 0 ? (
                            <div className="empty-state" style={{ padding: '80px 40px', textAlign: 'center' }}>
                                <UserX size={48} style={{ margin: '0 auto 16px', color: '#cbd5e1' }} />
                                <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>No matches found</h3>
                                <p style={{ color: '#64748b' }}>We couldn't find any users matching "<strong>{searchTerm}</strong>"</p>
                                <button
                                    onClick={() => setSearchTerm("")}
                                    style={{ marginTop: '16px', padding: '8px 16px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: '500' }}
                                >
                                    Clear Search
                                </button>
                            </div>
                        ) : (
                            /* CASE 3: Display the Table */
                            <>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>User ID</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Phone</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentRows.map((user) => (
                                            <tr key={user.userId}>
                                                <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div className="avatar">{user.name?.charAt(0) || '?'}</div>
                                                    <span style={{ fontWeight: '600' }}>{user.name}</span>
                                                </td>
                                                <td>USR-00{user.userId}</td>
                                                <td>{user.email}</td>
                                                <td>
                                                    <span className={`status-badge ${getRoleClass(user.role)}`} style={{ fontSize: '11px' }}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td style={{ color: '#64748b' }}>{user.phone || 'N/A'}</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button className="action-btn">
                                                        <MoreVertical size={18}/>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
 
                                {/* --- FOOTER --- */}
                                <div className="table-footer" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '15px',
                                    borderTop: '1px solid #f1f5f9'
                                }}>
                                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                                        Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, filteredUsers.length)} of {filteredUsers.length} entries
                                    </div>
 
                                    <div className="pagination-controls" style={{ display: 'flex', gap: '5px' }}>
                                        <button
                                            className="page-nav-btn"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(prev => prev - 1)}
                                            style={navBtnStyle}
                                        >
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
                                                    border: currentPage === item ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                                                    fontWeight: currentPage === item ? '600' : '400'
                                                }}
                                            >
                                                {item}
                                            </button>
                                        ))}
 
                                        <button
                                            className="page-nav-btn"
                                            disabled={currentPage === totalPages || totalPages === 0}
                                            onClick={() => setCurrentPage(prev => prev + 1)}
                                            style={navBtnStyle}
                                        >
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
 
const navBtnStyle = {
    display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s'
};
 
const pageNumStyle = {
    minWidth: '36px', height: '36px', padding: '0 6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s'
};
 
export default UserList;