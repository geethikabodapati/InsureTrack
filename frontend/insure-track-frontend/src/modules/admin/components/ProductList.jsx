import React, { useEffect, useState } from 'react';
import {
    getAllProducts,
    addProduct,
    addCoverage,
    addRatingRule
} from '../../../services/api';
import {
    Plus, MoreVertical, X, Search, ShieldPlus,
    Calculator, PackageOpen, AlertCircle
} from 'lucide-react';
import '../styles/AdminTables.css';
 
const ProductList = () => {
    // --- BASIC STATES ---
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeMenu, setActiveMenu] = useState(null);
 
    // --- MODAL STATES ---
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isCoverageModalOpen, setIsCoverageModalOpen] = useState(false);
    const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
   
    // --- SELECTED PRODUCT TRACKING ---
    const [selectedProductId, setSelectedProductId] = useState(null);
 
    // --- FORM DATA STATES ---
    const [productFormData, setProductFormData] = useState({ name: '', description: '' });
   
    const [coverageFormData, setCoverageFormData] = useState({
        coverageType: '',
        coverageLimit: '',
        deductible: ''
    });
 
    const [ruleFormData, setRuleFormData] = useState({
        expression: '',
        factor: '',
        weight: ''
    });
 
    // --- DATA FETCHING ---
    const fetchProducts = () => {
        setLoading(true);
        getAllProducts()
            .then(response => {
                // Handle different response structures from Axios
                const data = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
                setProducts(data);
                setLoading(false);
                setError(null);
            })
            .catch(err => {
                console.error("Fetch Error:", err);
                setError("Failed to connect to the backend server.");
                setLoading(false);
            });
    };
 
    useEffect(() => {
        fetchProducts();
        const closeMenu = () => setActiveMenu(null);
        window.addEventListener('click', closeMenu);
        return () => window.removeEventListener('click', closeMenu);
    }, []);
 
    // --- SUBMIT HANDLERS ---
    const handleProductSubmit = async (e) => {
        e.preventDefault();
        try {
            await addProduct({ ...productFormData, status: 'INACTIVE' });
            setIsProductModalOpen(false);
            setProductFormData({ name: '', description: '' });
            fetchProducts();
        } catch (err) { alert("Error adding product"); }
    };
 
    const handleCoverageSubmit = async (e) => {
        e.preventDefault();
        try {
            await addCoverage(selectedProductId, coverageFormData);
            setIsCoverageModalOpen(false);
            setCoverageFormData({ coverageType: '', coverageLimit: '', deductible: '' });
            fetchProducts();
        } catch (err) { alert("Error adding coverage"); }
    };
 
    const handleRuleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addRatingRule(selectedProductId, ruleFormData);
            setIsRuleModalOpen(false);
            setRuleFormData({ expression: '', factor: '', weight: '' });
            fetchProducts();
        } catch (err) { alert("Error adding rating rule"); }
    }
 
    // --- MODAL HELPERS ---
    const openCoverageModal = (id) => {
        setSelectedProductId(id);
        setIsCoverageModalOpen(true);
    };
 
    const openRuleModal = (id) => {
        setSelectedProductId(id);
        setIsRuleModalOpen(true);
    };
 
    // --- FILTERING ---
    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
 
    return (
        <div className="table-container">
            {/* Header Section */}
            <div className="table-header-section">
                <div className="table-title">
                    <h1>Vehicle Insurance Products</h1>
                    <p>Configure rating rules and coverages for your fleet offerings</p>
                </div>
                <button className="add-btn" onClick={() => setIsProductModalOpen(true)}>
                    <Plus size={18} /> Add New Category
                </button>
            </div>
 
            <div className="table-card">
                {/* Search Bar */}
                <div className="search-bar-container">
                    <div className="search-wrapper">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search by vehicle type (e.g. TRUCK)..."
                            className="search-input-field"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
 
                {/* --- LOADING STATE --- */}
                {loading && (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                        <div className="spinner"></div> {/* Ensure you have CSS for this */}
                        <p style={{ marginTop: '10px' }}>Fetching vehicle products from database...</p>
                    </div>
                )}
 
                {/* --- ERROR STATE --- */}
                {error && !loading && (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
                        <AlertCircle size={40} style={{ marginBottom: '10px' }}/>
                        <p>{error}</p>
                        <button onClick={fetchProducts} style={{ color: '#3b82f6', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>Try Again</button>
                    </div>
                )}
 
                {/* --- EMPTY STATE --- */}
                {!loading && !error && filteredProducts.length === 0 && (
                    <div className="empty-state-container" style={{ padding: '80px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <PackageOpen size={48} color="#cbd5e1" style={{ marginBottom: '15px' }} />
                        <h3 style={{ color: '#1e293b', marginBottom: '5px' }}>No products found</h3>
                        <p style={{ color: '#64748b' }}>
                            {searchTerm ? `No results match "${searchTerm}"` : "You haven't added any vehicle insurance products yet."}
                        </p>
                    </div>
                )}
 
                {/* --- DATA TABLE --- */}
                {!loading && !error && filteredProducts.length > 0 && (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Product ID</th>
                                <th>Vehicle Type</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Coverages</th>
                                <th>Rating Rules</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => {
                                const coverageCount = product.coverages?.length || 0;
                                const ruleCount = product.ratingRules?.length || 0;
                                const isReady = coverageCount >= 1 && ruleCount >= 1;
 
                                return (
                                    <tr key={product.productId}>
                                        <td style={{ fontWeight: '600' }}>PRD-{product.productId.toString().padStart(3, '0')}</td>
                                        <td style={{ fontWeight: 'bold' }}>{product.name}</td>
                                        <td style={{ color: '#6b7280' }}>{product.description}</td>
                                        <td>
                                            <span className={`status-badge ${isReady ? 'status-active' : 'status-inactive'}`}>
                                                {isReady ? "ACTIVE" : "INCOMPLETE"}
                                            </span>
                                        </td>
                                        <td>{coverageCount} active</td>
                                        <td>{ruleCount} rules</td>
                                        <td style={{ textAlign: 'right', position: 'relative' }}>
                                            <button className="action-btn" onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenu(activeMenu === product.productId ? null : product.productId);
                                            }}>
                                                <MoreVertical size={18}/>
                                            </button>
 
                                            {activeMenu === product.productId && (
                                                <div className="action-dropdown">
                                                    <button onClick={() => openCoverageModal(product.productId)}>
                                                        <ShieldPlus size={16} /> Add Coverage
                                                    </button>
                                                    <button onClick={() => openRuleModal(product.productId)}>
                                                        <Calculator size={16} /> Add Rating Rule
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
 
            {/* --- MODALS --- */}
 
            {/* PRODUCT MODAL */}
            {isProductModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Add New Vehicle Product</h2>
                            <button className="close-x" onClick={() => setIsProductModalOpen(false)}><X size={20}/></button>
                        </div>
                        <form onSubmit={handleProductSubmit}>
                            <div className="form-group">
                                <label>Vehicle Category</label>
                                <select
                                    value={productFormData.name}
                                    onChange={(e) => setProductFormData({...productFormData, name: e.target.value})}
                                    required
                                >
                                    <option value="">Select vehicle type</option>
                                    <option value="BUS">BUS</option>
                                    <option value="CAR">CAR</option>
                                    <option value="BIKE">BIKE</option>
                                    <option value="AUTO">AUTO</option>
                                    <option value="TRUCK">TRUCK</option>
                                    <option value="TRACTOR">TRACTOR</option>
                                    <option value="VAN">VAN</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    placeholder="e.g. Comprehensive insurance for commercial heavy trucks"
                                    value={productFormData.description}
                                    onChange={(e) => setProductFormData({...productFormData, description: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setIsProductModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-confirm">Create Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
 
            {/* COVERAGE MODAL */}
            {isCoverageModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Add Coverage (ID: {selectedProductId})</h2>
                            <button className="close-x" onClick={() => setIsCoverageModalOpen(false)}><X size={20}/></button>
                        </div>
                        <form onSubmit={handleCoverageSubmit}>
                            <div className="form-group">
                                <label>Coverage Type</label>
                                <select
                                    value={coverageFormData.coverageType}
                                    onChange={(e) => setCoverageFormData({...coverageFormData, coverageType: e.target.value})}
                                    required
                                >
                                    <option value="">Select Type</option>
                                    <option value="LIABILITY">LIABILITY</option>
                                    <option value="COLLISION">COLLISION</option>
                                    <option value="FIRE">FIRE</option>
                                    <option value="THEFT">THEFT</option>
                                    <option value="ZERO_DEPT">ZERO DEPRECIATION</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Coverage Limit ($)</label>
                                <input
                                    type="number"
                                    value={coverageFormData.coverageLimit}
                                    onChange={(e) => setCoverageFormData({...coverageFormData, coverageLimit: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Deductible ($)</label>
                                <input
                                    type="number"
                                    value={coverageFormData.deductible}
                                    onChange={(e) => setCoverageFormData({...coverageFormData, deductible: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setIsCoverageModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-confirm">Save Coverage</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
 
            {/* RATING RULE MODAL */}
            {isRuleModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Define Rating Rule (ID: {selectedProductId})</h2>
                            <button className="close-x" onClick={() => setIsRuleModalOpen(false)}><X size={20}/></button>
                        </div>
                        <form onSubmit={handleRuleSubmit}>
                            <div className="form-group">
                                <label>Formula Expression</label>
                                <input
                                    type="text"
                                    placeholder="e.g. base * 1.05"
                                    value={ruleFormData.expression}
                                    onChange={(e) => setRuleFormData({...ruleFormData, expression: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Rating Factor</label>
                                <select
                                    value={ruleFormData.factor}
                                    onChange={(e) => setRuleFormData({...ruleFormData, factor: e.target.value})}
                                    required
                                >
                                    <option value="">Select Factor</option>
                                    <option value="AGE">Vehicle Age</option>
                                    <option value="LOCATION">RTO Zone / Location</option>
                                    <option value="USAGE">Commercial Usage</option>
                                    <option value="CAPACITY">Cubic Capacity / Tonnage</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Weight / Multiplier</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={ruleFormData.weight}
                                    onChange={(e) => setRuleFormData({...ruleFormData, weight: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setIsRuleModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-confirm">Save Rule</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
 
export default ProductList;