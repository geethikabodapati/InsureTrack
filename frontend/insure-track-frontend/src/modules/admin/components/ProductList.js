import React, { useEffect, useState, useCallback } from 'react';
import {
    getAllProducts,
    addProduct,
    addCoverage,
    addRatingRule,
    deleteProduct,
    activateProduct,
    deactivateProduct
} from '../../../core/services/api';
import {
    Plus, MoreVertical, X, Search, ShieldPlus,
    Calculator, PackageOpen, AlertCircle, Trash2
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
    const [coverageFormData, setCoverageFormData] = useState({ coverageType: '', coverageLimit: '', deductible: '' });
    const [ruleFormData, setRuleFormData] = useState({ expression: 'basePremium*adjustment', factor: '', weight: '' });
 
    // --- VALIDATION STATE ---
    const [validationErrors, setValidationErrors] = useState({});
 
    // --- DYNAMIC DROPDOWNS ---
    const vehicleOptions = ["BUS", "CAR", "BIKE", "AUTO", "TRUCK", "TRACTOR", "VAN"];
    const availableVehicleOptions = vehicleOptions.filter(opt =>
        !products.some(p => p.name === opt)
    );
 
    const getAvailableCoverages = (productId) => {
        const product = products.find(p => p.productId === productId);
        const existingTypes = product?.coverages?.map(c => c.coverageType) || [];
        return ["LIABILITY", "COLLISION"].filter(type => !existingTypes.includes(type));
    };
 
    const getAvailableRules = (productId) => {
        const product = products.find(p => p.productId === productId);
        const existingFactors = product?.ratingRules?.map(r => r.factor) || [];
        return [
            { val: "AGE", label: "Vehicle Age" },
            { val: "LOCATION", label: "RTO Zone" },
            { val: "VEHICLE_TYPE", label: "Vehicle Type" }
        ].filter(rule => !existingFactors.includes(rule.val));
    };
 
    // --- DATA FETCHING & STATUS SYNC ---
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAllProducts();
            const data = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
           
            const updatedData = await Promise.all(data.map(async (product) => {
                const coverageCount = product.coverages?.length || 0;
                const ruleCount = product.ratingRules?.length || 0;
                const shouldBeActive = coverageCount >= 1 && ruleCount >= 1;
 
                if (shouldBeActive && product.status !== 'ACTIVE') {
                    try { await activateProduct(product.productId); product.status = 'ACTIVE'; } catch (e) {}
                } else if (!shouldBeActive && product.status !== 'INACTIVE') {
                    try { await deactivateProduct(product.productId); product.status = 'INACTIVE'; } catch (e) {}
                }
                return product;
            }));
 
            setProducts(updatedData);
            setError(null);
        } catch (err) {
            setError("Failed to connect to the backend server.");
        } finally {
            setLoading(false);
        }
    }, []);
 
    useEffect(() => {
        fetchProducts();
        const closeMenu = () => setActiveMenu(null);
        window.addEventListener('click', closeMenu);
        return () => window.removeEventListener('click', closeMenu);
    }, [fetchProducts]);
 
    // --- SUBMIT HANDLERS ---
    const handleProductSubmit = async (e) => {
        e.preventDefault();
        let errors = {};
        if (!productFormData.name) errors.name = "Vehicle category is required";
        if (!productFormData.description) {
            errors.description = "Description is required";
        } else if (productFormData.description.length > 50) {
            errors.description = "Maximum 50 characters allowed";
        }
 
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }
 
        try {
            await addProduct({ ...productFormData, status: 'INACTIVE' });
            alert(`Success: ${productFormData.name} added!`);
            setIsProductModalOpen(false);
            setProductFormData({ name: '', description: '' });
            setValidationErrors({});
            fetchProducts();
        } catch (err) { alert("Error adding product"); }
    };
 
    const handleCoverageSubmit = async (e) => {
        e.preventDefault();
        let errors = {};
        const limit = Number(coverageFormData.coverageLimit);
        const ded = Number(coverageFormData.deductible);
 
        if (!coverageFormData.coverageType) errors.coverageType = "Select a type";
        if (!coverageFormData.coverageLimit || limit < 20000 || limit > 5000000) {
            errors.coverageLimit = "Limit must be between ₹20,000 and ₹50,00,000";
        }
        if (!coverageFormData.deductible || ded < 500 || ded > 10000) {
            errors.deductible = "Deductible must be between ₹500 and ₹10,000";
        }
 
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }
 
        try {
            await addCoverage(selectedProductId, coverageFormData);
            alert(`Success: ${coverageFormData.coverageType} coverage added.`);
            setIsCoverageModalOpen(false);
            setCoverageFormData({ coverageType: '', coverageLimit: '', deductible: '' });
            setValidationErrors({});
            fetchProducts();
        } catch (err) { alert("Error adding coverage"); }
    };
 
    const handleRuleSubmit = async (e) => {
        e.preventDefault();
        let errors = {};
        const weightVal = Number(ruleFormData.weight);
 
        if (!ruleFormData.factor) errors.factor = "Select a factor";
        if (!ruleFormData.weight || weightVal < 1 || weightVal > 100) {
            errors.weight = "Weight must be between 1 and 100";
        }
 
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }
 
        try {
            await addRatingRule(selectedProductId, ruleFormData);
            alert(`Success: Rule added.`);
            setIsRuleModalOpen(false);
            setRuleFormData({ expression: 'basePremium*adjustment', factor: '', weight: '' });
            setValidationErrors({});
            fetchProducts();
        } catch (err) { alert("Error adding rating rule"); }
    };
 
    const handleDeleteProduct = async (id) => {
        if (window.confirm("Are you sure?")) {
            try {
                await deleteProduct(id);
                fetchProducts();
            } catch (err) { alert("Error deleting product."); }
        }
    };
 
    const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const errorStyle = { color: '#ef4444', fontSize: '12px', marginTop: '4px', fontWeight: '500' };
 
    return (
        <div className="table-container">
            <div className="table-header-section">
                <div className="table-title">
                    <h1>Vehicle Insurance Products</h1>
                    <p>Configure rating rules and coverages for your fleet offerings</p>
                </div>
                <button className="add-btn" onClick={() => { setProductFormData({ name: '', description: '' }); setValidationErrors({}); setIsProductModalOpen(true); }}>
                    <Plus size={18} /> Add New Category
                </button>
            </div>
 
            <div className="table-card">
                <div className="search-bar-container">
                    <div className="search-wrapper">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search by vehicle type..."
                            className="search-input-field"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
 
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center' }}>
                        <div className="spinner"></div>
                        <p style={{ marginTop: '10px', color: '#64748b' }}>Fetching vehicle products...</p>
                    </div>
                ) : error ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
                        <AlertCircle size={40} style={{ marginBottom: '10px' }}/>
                        <p>{error}</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    /* --- RESTORED "NO PRODUCT FOUND" VIEW --- */
                    <div className="empty-state-container" style={{ padding: '80px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <PackageOpen size={48} color="#cbd5e1" style={{ marginBottom: '15px' }} />
                        <h3 style={{ color: '#1e293b', marginBottom: '5px' }}>No products found</h3>
                        <p style={{ color: '#64748b' }}>
                            {searchTerm ? `No results match "${searchTerm}"` : "You haven't added any vehicle insurance products yet."}
                        </p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Vehicle Type</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Coverages</th>
                                <th>Rating Rules</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => (
                                <tr key={product.productId}>
                                    <td style={{ fontWeight: 'bold' }}>{product.name}</td>
                                    <td>{product.description}</td>
                                    <td>
                                        <span className={`status-badge ${product.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td>{product.coverages?.length || 0} active</td>
                                    <td>{product.ratingRules?.length || 0} rules</td>
                                    <td style={{ textAlign: 'right', position: 'relative' }}>
                                        <button className="action-btn" onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === product.productId ? null : product.productId); }}>
                                            <MoreVertical size={18}/>
                                        </button>
                                        {activeMenu === product.productId && (
                                            <div className="action-dropdown">
                                                <button onClick={() => { setSelectedProductId(product.productId); setValidationErrors({}); setIsCoverageModalOpen(true); }}><ShieldPlus size={16} /> Add Coverage</button>
                                                <button onClick={() => { setSelectedProductId(product.productId); setValidationErrors({}); setIsRuleModalOpen(true); }}><Calculator size={16} /> Add Rule</button>
                                                <button onClick={() => handleDeleteProduct(product.productId)} style={{ color: '#ef4444' }}><Trash2 size={16} /> Delete</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
 
            {/* PRODUCT MODAL */}
            {isProductModalOpen && (
                <div className="adm-modal-overlay">
                    <div className="adm-modal-content">
                        <div className="modal-header">
                            <h2>Add New Vehicle Product</h2>
                            <button className="close-x" onClick={() => setIsProductModalOpen(false)}><X size={20}/></button>
                        </div>
                        <form onSubmit={handleProductSubmit}>
                            <div className="form-group">
                                <label>Vehicle Category</label>
                                <select value={productFormData.name} onChange={(e) => setProductFormData({...productFormData, name: e.target.value})} style={{ borderColor: validationErrors.name ? '#ef4444' : '#e2e8f0' }}>
                                    <option value="">Select vehicle type</option>
                                    {availableVehicleOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                                {validationErrors.name && <div style={errorStyle}>{validationErrors.name}</div>}
                            </div>
                            <div className="form-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <label>Description</label>
                                    <span style={{ fontSize: '10px', color: (productFormData.description?.length || 0) >= 50 ? 'red' : '#94a3b8' }}>
                                        {productFormData.description?.length || 0}/50
                                    </span>
                                </div>
                                <textarea maxLength="50" placeholder="Brief description..." value={productFormData.description} onChange={(e) => setProductFormData({...productFormData, description: e.target.value})} style={{ borderColor: validationErrors.description ? '#ef4444' : '#e2e8f0' }} />
                                {validationErrors.description && <div style={errorStyle}>{validationErrors.description}</div>}
                            </div>
                            <div className="modal-footer">
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
                                <select value={coverageFormData.coverageType} onChange={(e) => setCoverageFormData({...coverageFormData, coverageType: e.target.value})} style={{ borderColor: validationErrors.coverageType ? '#ef4444' : '#e2e8f0' }}>
                                    <option value="">Select Type</option>
                                    {getAvailableCoverages(selectedProductId).map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                                {validationErrors.coverageType && <div style={errorStyle}>{validationErrors.coverageType}</div>}
                            </div>
                            <div className="form-group">
                                <label>Coverage Limit (₹)</label>
                                <input type="number" placeholder="Enter limit" value={coverageFormData.coverageLimit} onChange={(e) => setCoverageFormData({...coverageFormData, coverageLimit: e.target.value})} style={{ borderColor: validationErrors.coverageLimit ? '#ef4444' : '#e2e8f0' }} />
                                {validationErrors.coverageLimit && <div style={errorStyle}>{validationErrors.coverageLimit}</div>}
                            </div>
                            <div className="form-group">
                                <label>Deductible (₹)</label>
                                <input type="number" placeholder="Enter deductible" value={coverageFormData.deductible} onChange={(e) => setCoverageFormData({...coverageFormData, deductible: e.target.value})} style={{ borderColor: validationErrors.deductible ? '#ef4444' : '#e2e8f0' }} />
                                {validationErrors.deductible && <div style={errorStyle}>{validationErrors.deductible}</div>}
                            </div>
                            <div className="modal-footer">
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
                            <h2>Define Rating Rule</h2>
                            <button className="close-x" onClick={() => setIsRuleModalOpen(false)}><X size={20}/></button>
                        </div>
                        <form onSubmit={handleRuleSubmit}>
                            <div className="form-group">
                                <label>Formula Expression (Default)</label>
                                <input type="text" readOnly value={ruleFormData.expression} style={{ background: '#f8fafc', color: '#64748b' }} />
                            </div>
                            <div className="form-group">
                                <label>Rating Factor</label>
                                <select value={ruleFormData.factor} onChange={(e) => setRuleFormData({...ruleFormData, factor: e.target.value})} style={{ borderColor: validationErrors.factor ? '#ef4444' : '#e2e8f0' }}>
                                    <option value="">Select Factor</option>
                                    {getAvailableRules(selectedProductId).map(rule => <option key={rule.val} value={rule.val}>{rule.label}</option>)}
                                </select>
                                {validationErrors.factor && <div style={errorStyle}>{validationErrors.factor}</div>}
                            </div>
                            <div className="form-group">
                                <label>Weight (1 - 100)</label>
                                <input type="number" placeholder="Value between 1 and 100" value={ruleFormData.weight} onChange={(e) => setRuleFormData({...ruleFormData, weight: e.target.value})} style={{ borderColor: validationErrors.weight ? '#ef4444' : '#e2e8f0' }} />
                                {validationErrors.weight && <div style={errorStyle}>{validationErrors.weight}</div>}
                            </div>
                            <div className="modal-footer">
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