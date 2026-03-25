import React, { useEffect, useState } from 'react';
import { 
    getAllRatingRules, 
    deleteRatingRule, 
    getAllProducts 
} from '../../../core/services/api'; 
import { 
    Search, ChevronLeft, ChevronRight, 
    Inbox, SearchX, Trash2, AlertCircle 
} from 'lucide-react'; 
import '../styles/AdminTables.css'; 

const RatingRuleList = () => {
    // --- DATA STATES ---
    const [rules, setRules] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    
    // --- UI STATES ---
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10); 

    // --- FETCH DATA (Rules + Products for Name Mapping) ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const [rulesRes, productsRes] = await Promise.all([
                getAllRatingRules(),
                getAllProducts()
            ]);
            console.log(rulesRes,productsRes)

            // Handling potential nested data structures from Axios
            const rulesData = rulesRes.data || rulesRes;
            const productsData = productsRes.data || productsRes;

            setRules(Array.isArray(rulesData) ? rulesData : []);
            setProducts(Array.isArray(productsData) ? productsData : []);
            setError(null);
        } catch (err) {
            console.error("Fetch error:", err);
            setError("Failed to sync with the database. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- DELETE LOGIC ---
    const handleDelete = async (ruleId) => {
        if (window.confirm("Are you sure you want to delete this rating rule?")) {
            try {
                await deleteRatingRule(ruleId);
                
                // Optimistic UI Update: Filter out the deleted rule from local state
                setRules(prevRules => prevRules.filter(rule => (rule.ruleId || rule.id) !== ruleId));
                
                // Adjust pagination if the last item on the page was deleted
                if (currentRows.length === 1 && currentPage > 1) {
                    setCurrentPage(prev => prev - 1);
                }
            } catch (err) {
                alert("Error deleting rule. It might still be linked to active policies.");
            }
        }
    };

    // --- HELPER: Map Product ID to Name ---
    const getProductName = (id) => {
        const product = products.find(p => String(p.productId) === String(id) || String(p.id) === String(id));
        return product ? product.name : `Unknown Product (ID: ${id})`;
    };

    // --- FILTER & PAGINATION LOGIC ---
    const filteredRules = rules.filter(rule => {
        const prodName = getProductName(rule.productId).toLowerCase();
        const search = searchTerm.toLowerCase();
        return (
            rule.factor?.toLowerCase().includes(search) ||
            rule.expression?.toLowerCase().includes(search) ||
            prodName.includes(search)
        );
    });

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
            {/* Header Section */}
            <div className="table-header-section">
                <div className="table-title">
                    <h1>Rating Rules Engine</h1>
                    <p>View and manage existing premium multipliers</p>
                </div>
                {/* "Define New Rule" button removed as it's handled in ProductList.js */}
            </div>

            <div className="table-card">
                {/* Search & Entries Controls */}
                <div className="table-controls-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px' }}>
                    <div className="search-wrapper" style={{ width: '350px', position: 'relative' }}>
                        <Search className="search-icon" size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input 
                            type="text" 
                            placeholder="Search by factor, formula, or product..." 
                            className="search-input-field"
                            style={{ paddingLeft: '35px', width: '100%', height: '40px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>

                    <div className="page-length" style={{ color: '#64748b', fontSize: '14px' }}>
                        Display 
                        <select 
                            value={rowsPerPage} 
                            onChange={(e) => {setRowsPerPage(Number(e.target.value)); setCurrentPage(1);}}
                            style={{ margin: '0 8px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                        </select> 
                        rows
                    </div>
                </div>

                {loading ? (
                    <div style={{padding: '100px', textAlign: 'center'}}>
                        <div className="spinner"></div>
                        <p style={{ color: '#64748b', marginTop: '10px' }}>Loading rules...</p>
                    </div>
                ) : error ? (
                    <div style={{padding: '60px', textAlign: 'center', color: '#ef4444'}}>
                        <AlertCircle size={40} style={{ margin: '0 auto 10px' }} />
                        <p><strong>{error}</strong></p>
                    </div>
                ) : (
                    <>
                        {rules.length === 0 ? (
                            <div style={{ padding: '80px 20px', textAlign: 'center', color: '#64748b' }}>
                                <Inbox size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                                <h3>No Rules Found</h3>
                                <p>There are currently no rating rules defined in the system.</p>
                            </div>
                        ) : filteredRules.length === 0 ? (
                            <div style={{ padding: '80px 20px', textAlign: 'center', color: '#64748b' }}>
                                <SearchX size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                                <h3>No Matches Found</h3>
                                <p>No results for "<strong>{searchTerm}</strong>"</p>
                            </div>
                        ) : (
                            <>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Applied Formula</th>
                                            <th>Rating Factor</th>
                                            <th>Weight</th>
                                            <th>Target Product</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentRows.map((rule) => (
                                            <tr key={rule.ruleId || rule.id}>
                                                <td>
                                                    <code style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', color: '#1e40af', fontSize: '13px' }}>
                                                        {rule.expression}
                                                    </code>
                                                </td>
                                                <td><span className="status-badge status-active">{rule.factor}</span></td>
                                                <td style={{ fontWeight: '600' }}>{rule.weight}</td>
                                                <td style={{ color: '#1e293b', fontWeight: '500' }}>
                                                    {getProductName(rule.productId)}
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button 
                                                        className="delete-action-btn" 
                                                        onClick={() => handleDelete(rule.ruleId || rule.id)}
                                                        title="Delete Rule"
                                                        style={{ 
                                                            padding: '8px', 
                                                            borderRadius: '6px', 
                                                            border: 'none', 
                                                            background: 'transparent', 
                                                            color: '#ef4444', 
                                                            cursor: 'pointer',
                                                            transition: 'background 0.2s'
                                                        }}
                                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                    >
                                                        <Trash2 size={19}/>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Pagination Footer */}
                                <div className="table-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderTop: '1px solid #f1f5f9' }}>
                                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                                        Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, filteredRules.length)} of {filteredRules.length} rules
                                    </div>

                                    <div className="pagination-controls" style={{ display: 'flex', gap: '5px' }}>
                                        <button className="page-nav-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} style={navBtnStyle}>
                                            <ChevronLeft size={16} />
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
                                            <ChevronRight size={16} />
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

// Reusable Button Styles
const navBtnStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s'
};

const pageNumStyle = {
    minWidth: '36px', height: '36px', padding: '0 6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s'
};

export default RatingRuleList;