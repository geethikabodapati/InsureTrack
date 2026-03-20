import React, { useEffect, useState } from 'react';
import { getAllRatingRules, addRatingRule } from '../../../services/api';
import { MoreVertical, X, Search, ChevronLeft, ChevronRight, Inbox, SearchX } from 'lucide-react';
import '../styles/AdminTables.css';
 
const RatingRuleList = () => {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
   
    // --- PAGINATION STATE ---
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
 
    const [formData, setFormData] = useState({
        expression: '',
        factor: '',
        weight: '',
        productId: ''
    });
 
    const fetchRules = () => {
        setLoading(true);
        getAllRatingRules()
            .then(response => {
                const data = response.data || response;
                setRules(Array.isArray(data) ? data : []);
                setLoading(false);
                setError(null);
            })
            .catch(err => {
                setError("Failed to fetch rating rules.");
                setLoading(false);
            });
    };
 
    useEffect(() => {
        fetchRules();
    }, []);
 
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { productId, ...ruleData } = formData;
            await addRatingRule(productId, ruleData);
            setIsModalOpen(false);
            setFormData({ expression: '', factor: '', weight: '', productId: '' });
            fetchRules();
        } catch (err) {
            alert("Error adding rule. Check if Product ID exists.");
        }
    };
 
    // 1. Filter logic
    const filteredRules = rules.filter(rule =>
        rule.factor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.expression?.toLowerCase().includes(searchTerm.toLowerCase())
    );
 
    // 2. Pagination Calculation
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredRules.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredRules.length / rowsPerPage);
 
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };
 
    const getPaginationGroup = () => {
        let start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
        if (totalPages <= 5) start = 1;
        const group = [];
        for (let i = 0; i < Math.min(5, totalPages); i++) {
            group.push(start + i);
        }
        return group;
    };
 
    return (
        <div className="table-container">
            <div className="table-header-section">
                <div className="table-title">
                    <h1>Rating Rules</h1>
                    <p>Configure premium calculation logic</p>
                </div>
            </div>
 
            <div className="table-card">
                {/* --- SEARCH & ENTRIES CONTROLS --- */}
                <div className="table-controls-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px' }}>
                    <div className="search-wrapper" style={{ width: '300px', position: 'relative' }}>
                        <Search className="search-icon" size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Search rules..."
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
                    <div className="loading-text" style={{padding: '60px', textAlign: 'center', color: '#64748b'}}>Loading rules...</div>
                ) : error ? (
                    <div className="error-box" style={{padding: '40px', color: '#ef4444', textAlign: 'center'}}>
                        <strong>{error}</strong>
                    </div>
                ) : (
                    <>
                        {/* --- CASE 1: No rules exist in the database at all --- */}
                        {rules.length === 0 ? (
                            <div style={{ padding: '80px 20px', textAlign: 'center', color: '#64748b' }}>
                                <Inbox size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                                <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>No rules available</h3>
                                <p>There are currently no rating rules configured in the system.</p>
                            </div>
                        ) :
                        /* --- CASE 2: Rules exist, but search filter returned nothing --- */
                        filteredRules.length === 0 ? (
                            <div style={{ padding: '80px 20px', textAlign: 'center', color: '#64748b' }}>
                                <SearchX size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                                <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>No matches found</h3>
                                <p>We couldn't find any rules matching "<strong>{searchTerm}</strong>"</p>
                                <button
                                    onClick={() => setSearchTerm("")}
                                    style={{ marginTop: '16px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            /* --- CASE 3: Display the data table --- */
                            <>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Rule ID</th>
                                            <th>Expression</th>
                                            <th>Factor</th>
                                            <th>Weight</th>
                                            <th>Product</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentRows.map((rule) => (
                                            <tr key={rule.ruleId || rule.id}>
                                                <td>RR-00{rule.ruleId || rule.id}</td>
                                                <td><code>{rule.expression}</code></td>
                                                <td><span className="status-badge status-active">{rule.factor}</span></td>
                                                <td>{rule.weight}</td>
                                                <td>PRD-{rule.productId}</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button className="action-btn"><MoreVertical size={18}/></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
 
                                {/* --- FOOTER --- */}
                                <div className="table-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderTop: '1px solid #f1f5f9' }}>
                                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                                        Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, filteredRules.length)} of {filteredRules.length} entries
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
                                                    border: currentPage === item ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                                                    fontWeight: currentPage === item ? '600' : '400'
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
 
            {/* Modal remains available (can be triggered by parent or other logic) */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Add Rating Rule</h2>
                            <button className="close-x" onClick={() => setIsModalOpen(false)}><X size={20}/></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Expression</label>
                                <input type="text" value={formData.expression} onChange={(e) => setFormData({...formData, expression: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Factor</label>
                                <input type="text" value={formData.factor} onChange={(e) => setFormData({...formData, factor: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Weight</label>
                                <input type="number" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Product ID</label>
                                <input type="number" value={formData.productId} onChange={(e) => setFormData({...formData, productId: e.target.value})} required />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-confirm">Save Rule</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
 
const navBtnStyle = {
    display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s'
};
 
const pageNumStyle = {
    minWidth: '36px', height: '36px', padding: '0 6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s'
};
 
export default RatingRuleList;