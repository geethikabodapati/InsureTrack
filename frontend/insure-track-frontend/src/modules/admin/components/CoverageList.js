import React, { useEffect, useState } from 'react';
import { getAllCoverages, deleteCoverage } from '../../../core/services/api'; 
import { Trash2, Search, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import '../styles/AdminTables.css'; 

const CoverageList = () => {
    const [coverages, setCoverages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10); 

    const fetchCoverages = () => {
        setLoading(true);
        getAllCoverages()
            .then(response => {
                const data = Array.isArray(response.data) ? response.data : response;
                setCoverages(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    useEffect(() => { fetchCoverages(); }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this coverage? This may affect product status.")) {
            try {
                await deleteCoverage(id);
                // Update local state to remove the item immediately
                setCoverages(prev => prev.filter(c => c.coverageId !== id));
            } catch (err) {
                alert("Failed to delete coverage.");
            }
        }
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return 'N/A';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency', currency: 'INR', maximumFractionDigits: 0,
        }).format(amount);
    };

    const filteredCoverages = coverages.filter(cov => 
        cov.coverageType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cov.productName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Calculation
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredCoverages.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredCoverages.length / rowsPerPage);

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
                    <h1>Coverages</h1>
                    <p>View all protection plans across all products</p>
                </div>
            </div>

            <div className="table-card">
                <div className="table-controls-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px' }}>
                    <div className="search-wrapper" style={{ width: '300px', position: 'relative' }}>
                        <Search className="search-icon" size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input 
                            type="text" placeholder="Search type or product..." 
                            className="search-input-field"
                            style={{ paddingLeft: '35px', width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    <div style={{ color: '#64748b', fontSize: '14px' }}>
                        Show 
                        <select value={rowsPerPage} onChange={(e) => {setRowsPerPage(Number(e.target.value)); setCurrentPage(1);}} style={{ margin: '0 8px', padding: '6px' }}>
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                        </select> 
                        entries
                    </div>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Limit</th>
                            <th>Deductible</th>
                            <th>Product</th> {/* Column changed */}
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!loading && currentRows.map((cov) => (
                            <tr key={cov.coverageId}>
                                <td>{cov.coverageType}</td>
                                <td style={{ fontWeight: '600' }}>{formatCurrency(cov.coverageLimit)}</td>
                                <td>{formatCurrency(cov.deductible)}</td>
                                {/* Displays Product Name now */}
                                <td>
                                    <span style={{ fontWeight: '500', color: '#1e293b' }}>{cov.productName}</span>
                                    <br />
                                    {/* <small style={{ color: '#94a3b8' }}>ID: PRD-{cov.productId}</small> */}
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <button 
                                        onClick={() => handleDelete(cov.coverageId)}
                                        className="delete-btn" 
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '8px', borderRadius: '6px' }}
                                        title="Delete Coverage"
                                    >
                                        <Trash2 size={18}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
               
                
                {/* --- LOADING STATE --- */}
                {loading && (
                    <div className="loading-state" style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                        <div className="spinner" style={{ marginBottom: '10px' }}>Loading coverages...</div>
                    </div>
                )}
                
                {/* --- EMPTY STATE --- */}
                {!loading && filteredCoverages.length === 0 && (
                    <div className="empty-state" style={{ padding: '80px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Inbox size={48} color="#cbd5e1" style={{ marginBottom: '15px' }} />
                        <h3 style={{ color: '#1e293b', marginBottom: '5px' }}>No coverages found</h3>
                        <p style={{ color: '#64748b' }}>
                            {searchTerm ? `No matches found for "${searchTerm}"` : "The coverage directory is currently empty."}
                        </p>
                    </div>
                )}

                {/* --- FOOTER / PAGINATION --- */}
                {!loading && filteredCoverages.length > 0 && (
                    <div className="table-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderTop: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '14px', color: '#64748b' }}>
                            Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, filteredCoverages.length)} of {filteredCoverages.length} entries
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
                )}
            </div>
        </div>
    );
};

// Styles
const navBtnStyle = { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '4px', 
    padding: '6px 14px', 
    borderRadius: '8px', 
    border: '1px solid #e2e8f0', 
    background: '#fff', 
    fontSize: '14px', 
    cursor: 'pointer', 
    color: '#64748b',
    transition: 'all 0.2s'
};

const pageNumStyle = { 
    minWidth: '36px', 
    height: '36px', 
    borderRadius: '8px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s'
};

export default CoverageList;