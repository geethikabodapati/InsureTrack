import React, { useState, useEffect, useCallback } from 'react';
import { addInsuredObject, getInsuredObjects, getAllProducts } from '../../../core/services/api';
import { Car, Bike, Plus, ShieldCheck, Truck, Tractor, AlertCircle } from 'lucide-react';

const InsuredObjects = () => {
    const [objects, setObjects] = useState([]);
    const [products, setProducts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // Internal state stores more fields for UX, but we filter them before sending
    const [form, setForm] = useState({ 
        objectType: '', 
        make: '', 
        year: '' 
    });

    const customerId = localStorage.getItem("customerId");
    const currentYear = new Date().getFullYear();

    const loadData = useCallback(async () => {
        if (!customerId || customerId === "undefined") return setLoading(false);
        try {
            const [objectsRes, productsRes] = await Promise.all([
                getInsuredObjects(customerId),
                getAllProducts()
            ]);

            // Parse data and handle inconsistent JSON structures from DB
            const parsedData = objectsRes.data.map(obj => {
                let details = obj.detailsJson;
                if (typeof details === 'string') {
                    try { details = JSON.parse(details); } catch (e) { details = {}; }
                }
                return { ...obj, detailsJson: details };
            });
            setObjects(parsedData || []);

            const activeProducts = productsRes.data.filter(p => p.status === 'ACTIVE');
            setProducts(activeProducts);

            if (activeProducts.length > 0 && !form.objectType) {
                setForm(f => ({ ...f, objectType: activeProducts[0].name }));
            }
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    }, [customerId, form.objectType]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleAdd = async (e) => {
        e.preventDefault();
        
        // Calculate Age from Year input
        const purchaseYear = parseInt(form.year);
        const calculatedAge = !isNaN(purchaseYear) ? Math.max(0, currentYear - purchaseYear) : 0;

        try {
            // STRICT DATA MAPPING: Only send what the backend wants
            const dto = {
                objectType: form.objectType,
                detailsJson: {
                    age: calculatedAge,          // Sent as "age"
                    vehicleType: form.objectType // Sent as "vehicleType"
                }
            };

            await addInsuredObject(customerId, dto);
            alert("Asset added successfully!");
            setShowForm(false);
            
            // Reset form
            setForm({ objectType: products[0]?.name || '', make: '', year: '' });
            loadData();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add asset");
        }
    };

    const getIcon = (type) => {
        const t = type?.toUpperCase();
        switch(t) {
            case 'CAR': return <Car size={24} />;
            case 'BUS': 
            case 'TRUCK': return <Truck size={24} />;
            case 'TRACTOR': return <Tractor size={24} />;
            default: return <Bike size={24} />;
        }
    };

    if (loading) return <div className="p-5 text-center text-muted">Loading your assets...</div>;

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold">Insured Objects</h3>
                <button className="btn btn-primary d-flex align-items-center shadow-sm" onClick={() => setShowForm(!showForm)}>
                    <Plus size={18} className="me-2" /> Add New Asset
                </button>
            </div>

            {showForm && (
                <div className="card border-0 shadow-sm p-4 mb-4 animate-fade-in" style={{ borderRadius: '12px' }}>
                    <div className="d-flex align-items-center mb-3 text-primary">
                        <AlertCircle size={18} className="me-2" />
                        <h5 className="mb-0">New Asset Registration</h5>
                    </div>
                    <form onSubmit={handleAdd} className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label small fw-bold">Vehicle Type</label>
                            <select 
                                className="form-select" 
                                value={form.objectType} 
                                onChange={e => setForm({...form, objectType: e.target.value})}
                                required
                            >
                                <option value="" disabled>Select Type</option>
                                {products.map(product => (
                                    <option key={product.productId} value={product.name}>{product.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label small fw-bold">Company (Make)</label>
                            <input 
                                className="form-control" 
                                value={form.make} 
                                placeholder="e.g. Honda, Suzuki" 
                                onChange={e => setForm({...form, make: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label small fw-bold">Year of Purchase</label>
                            <input 
                                className="form-control" 
                                type="number" 
                                value={form.year} 
                                placeholder="e.g. 2022" 
                                min="1900"
                                max={currentYear}
                                onChange={e => setForm({...form, year: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="col-12 text-end mt-4">
                            <button type="button" className="btn btn-link text-muted me-3" onClick={() => setShowForm(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary px-4">Register Asset</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="row g-4">
                {objects.length > 0 ? objects.map((obj, i) => {
                    // Display logic handles both old (make/year) and new (age/vehicleType) formats
                    const displayType = obj.detailsJson?.vehicleType || obj.objectType;
                    const displayAge = obj.detailsJson?.age !== undefined 
                        ? obj.detailsJson.age 
                        : (obj.detailsJson?.year ? currentYear - parseInt(obj.detailsJson.year) : 'N/A');

                    return (
                        <div key={obj.objectId || i} className="col-md-4">
                            <div className="card border-0 shadow-sm h-100 asset-card" style={{ borderRadius: '15px' }}>
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="p-3 bg-light text-primary rounded-3">
                                            {getIcon(displayType)}
                                        </div>
                                        <span className="badge bg-success-subtle text-success rounded-pill px-3">Status: Active</span>
                                    </div>
                                    
                                    <h5 className="fw-bold mb-1">{obj.detailsJson?.make || 'Standard'} {displayType}</h5>
                                    <div className="mt-3">
                                        <div className="d-flex justify-content-between py-1">
                                            <span className="text-muted small">Vehicle Type</span>
                                            <span className="fw-bold small">{displayType}</span>
                                        </div>
                                        <div className="d-flex justify-content-between py-1">
                                            <span className="text-muted small">Age of Vehicle</span>
                                            <span className="fw-bold small">{displayAge} {displayAge === 1 ? 'Year' : 'Years'}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="border-top pt-3 mt-3">
                                        <div className="d-flex align-items-center text-success small">
                                            <ShieldCheck size={14} className="me-2" />
                                            <span>Full Insurance Coverage</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }) : !showForm && (
                    <div className="col-12 text-center p-5 bg-white rounded shadow-sm">
                        <div className="text-muted mb-3 opacity-25"><ShieldCheck size={64} /></div>
                        <h5 className="text-dark">No Assets Found</h5>
                        <p className="text-muted">You haven't registered any vehicles yet. Click "Add New Asset" to begin.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InsuredObjects;