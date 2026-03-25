import React, { useState, useEffect } from 'react';
import { getInsuredObjects, getAllProducts, createQuoteDraft } from '../../../core/services/api';
import { Shield, ChevronDown, Check, X, Loader2, ArrowRight, Info } from 'lucide-react';
 
const Coverages = () => {
    const [myAssets, setMyAssets] = useState([]);
    const [availableProducts, setAvailableProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
   
    // Selection States
    const [selectedAssetId, setSelectedAssetId] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedCoverageObjects, setSelectedCoverageObjects] = useState([]);
 
    const customerId = localStorage.getItem("customerId");
 
    useEffect(() => {
        const loadInitialData = async () => {
            if (!customerId) return setLoading(false);
            try {
                const [assetsRes, productsRes] = await Promise.all([
                    getInsuredObjects(customerId),
                    getAllProducts()
                ]);
                setMyAssets(assetsRes.data || []);
                setAvailableProducts(productsRes.data || []);
            } catch (err) {
                console.error("Data Load Error:", err);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [customerId]);
 
    const handleAssetChange = (assetId) => {
        setSelectedAssetId(assetId);
        const asset = myAssets.find(a => a.objectId.toString() === assetId);
       
        if (asset && asset.objectType) {
            const assetType = asset.objectType.toUpperCase();
            const matching = availableProducts.filter(p =>
                (p.name && p.name.toUpperCase().includes(assetType)) ||
                p.coverages?.some(cov => cov.coverageType?.toUpperCase().includes(assetType))
            );
            setFilteredProducts(matching.length === 0 ? availableProducts : matching);
        } else {
            setFilteredProducts([]);
        }
        setSelectedProduct(null);
        setSelectedCoverageObjects([]);
    };
 
    const handleToggleCoverage = (coverage) => {
        const isSelected = selectedCoverageObjects.some(c => c.coverageId === coverage.coverageId);
        if (isSelected) {
            setSelectedCoverageObjects(selectedCoverageObjects.filter(c => c.coverageId !== coverage.coverageId));
        } else {
            setSelectedCoverageObjects([...selectedCoverageObjects, coverage]);
        }
    };
 
    const handleCreateQuote = async () => {
    if (!selectedAssetId || !selectedProduct || selectedCoverageObjects.length === 0) {
        alert("Please select an asset, a plan, and at least one coverage.");
        return;
    }
 
    setSubmitting(true);
    try {
        // Map the array to only include the coverageType strings
        const coverageTypesOnly = selectedCoverageObjects.map(c => c.coverageType);
 
        const dto = {
            customerId: parseInt(customerId),
            productId: selectedProduct.productId,
            insuredObjectId: parseInt(selectedAssetId),
            // This will now save as ["COLLISION", "LIABILITY"] instead of full objects
            coveragesJSON: JSON.stringify(coverageTypesOnly)
        };
       
        const response = await createQuoteDraft(dto);
        alert(`Draft Created Successfully!`);
       
        // Reset form...
    } catch (err) {
        console.error("Submission error:", err);
    } finally {
        setSubmitting(false);
    }
};
 
    if (loading) return (
        <div className="d-flex flex-column align-items-center justify-content-center p-5">
            <Loader2 className="animate-spin text-primary mb-3" size={40} />
            <p className="text-muted">Fetching your insurance options...</p>
        </div>
    );
 
    return (
        <div className="container py-4">
            <div className="row mb-4 text-left">
                <div className="col">
                    <h2 className="fw-bold">Create Insurance Draft</h2>
                    <p className="text-muted">Pick an asset and select specific coverages from the dropdown.</p>
                </div>
            </div>
 
            <div className="row justify-content-left">
                <div className="col-lg-12">
                    <div className="card shadow-sm border-0 p-4">
                       
                        {/* 1. ASSET SELECTION */}
                        <div className="mb-4">
                            <label className="form-label fw-bold text-primary">1. Select Asset</label>
                            <select
                                className="form-select form-select-lg"
                                onChange={(e) => handleAssetChange(e.target.value)}
                                value={selectedAssetId}
                            >
                                <option value="">-- Choose Asset --</option>
                                {myAssets.map(a => (
                                    <option key={a.objectId} value={a.objectId}>
                                        {a.objectType} (ID: {a.objectId})
                                    </option>
                                ))}
                            </select>
                        </div>
 
                        {/* 2. PRODUCT SELECTION */}
                        {selectedAssetId && (
                            <div className="mb-4">
                                <label className="form-label fw-bold text-primary">2. Select Insurance Product</label>
                                <div className="d-flex flex-wrap gap-2">
                                    {filteredProducts.map(p => (
                                        <button
                                            key={p.productId}
                                            className={`btn ${selectedProduct?.productId === p.productId ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            onClick={() => { setSelectedProduct(p); setSelectedCoverageObjects([]); }}
                                        >
                                            {p.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
 
                        {/* 3. MULTI-SELECT COVERAGE DROPDOWN */}
                        {selectedProduct && (
                            <div className="mb-4">
                                <label className="form-label fw-bold text-primary">3. Add Coverages (Dropdown List)</label>
                                <div className="dropdown">
                                    <button
                                        className="btn btn-white border w-100 d-flex justify-content-between align-items-center py-2"
                                        type="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        <span className="text-muted">
                                            {selectedCoverageObjects.length > 0
                                                ? `${selectedCoverageObjects.length} Coverage(s) selected`
                                                : "Click to see available coverage types..."}
                                        </span>
                                        <ChevronDown size={20} />
                                    </button>
                                    {/* Simplified Dropdown Logic for Debugging */}
<ul className="dropdown-menu w-100 shadow-sm p-2" style={{ display: 'block', position: 'relative', maxHeight: '200px', overflowY: 'auto' }}>
    {selectedProduct?.coverages && selectedProduct.coverages.length > 0 ? (
        selectedProduct.coverages.map(cov => (
            <li key={cov.coverageId} onClick={() => handleToggleCoverage(cov)} className="dropdown-item">
                {cov.coverageType} — ₹{cov.coverageLimit}
            </li>
        ))
    ) : (
        <li className="dropdown-item text-danger small">No coverages found for this product</li>
    )}
</ul>
                                </div>
 
                                {/* Selection Summary (Pills) */}
                                <div className="mt-3 d-flex flex-wrap gap-2">
                                    {selectedCoverageObjects.map(c => (
                                        <span key={c.coverageId} className="badge bg-primary d-flex align-items-center p-2 rounded-pill">
                                            {c.coverageType}
                                            <X size={14} className="ms-2" style={{ cursor: 'pointer' }} onClick={() => handleToggleCoverage(c)} />
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
 
                        {/* SUBMIT BUTTON */}
                        <div className="mt-4 pt-3 border-top">
                            <div className="d-flex justify-content-end mt-4">
    <button
        onClick={handleCreateQuote}
        className="btn btn-success btn-lg fw-bold shadow-sm px-5"
        disabled={submitting || selectedCoverageObjects.length === 0}
    >
        {submitting ? (
            <>
                <Loader2 className="animate-spin me-2" /> Saving...
            </>
        ) : (
            "Save"
        )}
    </button>
</div>
                        </div>
 
                    </div>
                </div>
            </div>
        </div>
    );
};
 
export default Coverages;