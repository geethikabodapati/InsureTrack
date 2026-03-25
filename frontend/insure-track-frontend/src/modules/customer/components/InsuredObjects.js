/*import React, { useState, useEffect, useCallback } from 'react';
import { addInsuredObject, getCustomerById } from '../../../core/services/api';
import { Car, Home, Bike, Plus, ShieldCheck } from 'lucide-react';

const InsuredObjects = () => {
    const [objects, setObjects] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ objectType: 'BIKE', make: '', model: '', year: '', value: '' });

    const customerId = localStorage.getItem("customerId");

    const loadObjects = useCallback(async () => {
        if (!customerId || customerId === "undefined") return setLoading(false);
        try {
            const res = await getCustomerById(customerId);
            setObjects(res.data.insuredObjects || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [customerId]);

    useEffect(() => { loadObjects(); }, [loadObjects]);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            // Mapping fields to the detailsJson Map expected by your DTO
            const dto = {
                objectType: form.objectType,
                detailsJson: {
                    make: form.make,
                    model: form.model,
                    year: form.year,
                    
                }
            };
            await addInsuredObject(customerId, dto);
            alert("Asset added successfully!");
            setShowForm(false);
            loadObjects();
        } catch (err) { alert("Failed to add asset"); }
    };

    const getIcon = (type) => {
        if (type === 'VEHICLE') return <Car size={24} />;
        if (type === 'PROPERTY') return <Home size={24} />;
        return <Bike size={24} />;
    };

    if (loading) return <div className="p-5 text-center">Loading Assets...</div>;

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold">Insured Objects</h3>
                <button className="btn btn-primary d-flex align-items-center" onClick={() => setShowForm(!showForm)}>
                    <Plus size={18} className="me-2" /> Add New Asset
                </button>
            </div>

             ADD ASSET FORM 
            {showForm && (
                <div className="card border-0 shadow-sm p-4 mb-4 animate-fade-in">
                    <h5 className="mb-3">Asset Details</h5>
                    <form onSubmit={handleAdd} className="row g-3">
                        <div className="col-md-3">
                            <label className="form-label small">Type</label>
                            <select className="form-select" onChange={e => setForm({...form, objectType: e.target.value})}>
                                <option value="BIKE">BIKE</option>
                                <option value="BUS">BUS</option>
                                
                                <option value="CAR">CAR</option>
                                <option value="AUTO">AUTO</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small">Make/Brand</label>
                            <input className="form-control" placeholder="e.g. Toyota" onChange={e => setForm({...form, make: e.target.value})} required />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small">Model</label>
                            <input className="form-control" placeholder="e.g. Camry 2024" onChange={e => setForm({...form, model: e.target.value})} required />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small">Year</label>
                            <input type="year" className="form-control"  onChange={e => setForm({...form, year: e.target.value})} required />
                        </div>
                        
                        <div className="col-12 text-end">
                            <button type="button" className="btn btn-light me-2" onClick={() => setShowForm(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary">Submit for Review</button>
                        </div>
                    </form>
                </div>
            )}

             ASSET CARDS 
            <div className="row g-4">
                {objects.map((obj, i) => (
                    <div key={i} className="col-md-4">
                        <div className="card border-0 shadow-sm h-100 asset-card">
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className="p-3 bg-primary-soft text-primary rounded-3">
                                        {getIcon(obj.objectType)}
                                    </div>
                                    <span className="badge badge-approved rounded-pill px-3">Insured</span>
                                </div>
                                <h5 className="fw-bold mb-1">{obj.detailsJson?.make || 'Asset'} {obj.detailsJson?.model || '' }</h5>
                                <p className="text-muted small mb-3">ID: OBJ-00{obj.objectId || i}</p>
                                
                                <div className="border-top pt-3 mt-3">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted small">Insured Value</span>
                                        <span className="fw-bold text-dark">${obj.detailsJson?.marketValue || '0'}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted small">Coverage Status</span>
                                        <span className="text-success small d-flex align-items-center">
                                            <ShieldCheck size={14} className="me-1"/> Active
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {objects.length === 0 && !showForm && (
                    <div className="text-center p-5 bg-white rounded shadow-sm">
                        <div className="text-muted mb-3"><ShieldCheck size={48} /></div>
                        <h5>No Insured Objects Found</h5>
                        <p className="text-muted">Register your first asset to start coverage.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
export default InsuredObjects;*/
import React, { useState, useEffect, useCallback } from 'react';
// FIX 1: Import the specific list function
import { addInsuredObject, getInsuredObjects } from '../../../core/services/api';
import { Car, Home, Bike, Plus, ShieldCheck, Truck } from 'lucide-react';

const InsuredObjects = () => {
    const [objects, setObjects] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    // Added 'value' to the initial state
    const [form, setForm] = useState({ objectType: 'BIKE', make: '', model: '', year: '', value: '' });

    const customerId = localStorage.getItem("customerId");

    const loadObjects = useCallback(async () => {
    if (!customerId || customerId === "undefined") return setLoading(false);
    try {
        const res = await getInsuredObjects(customerId);
        
        // Ensure detailsJson is an object, not a string
        const parsedData = res.data.map(obj => {
            let details = obj.detailsJson;
            if (typeof details === 'string') {
                try { details = JSON.parse(details); } catch (e) { details = {}; }
            }
            return { ...obj, detailsJson: details };
        });

        setObjects(parsedData || []);
    } catch (err) { 
        console.error("Error fetching objects:", err); 
    } finally { 
        setLoading(false); 
    }
}, [customerId]);

    useEffect(() => { loadObjects(); }, [loadObjects]);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const dto = {
                objectType: form.objectType,
                detailsJson: {
                    make: form.make,
                    model: form.model,
                    year: form.year,
                    marketValue: form.value // Mapping form 'value' to 'marketValue'
                }
            };
            await addInsuredObject(customerId, dto);
            alert("Asset added successfully!");
            setShowForm(false);
            setForm({ objectType: 'BIKE', make: '', model: '', year: '', value: '' }); // Reset
            loadObjects();
        } catch (err) { 
            alert(err.response?.data?.message || "Failed to add asset"); 
        }
    };

    const getIcon = (type) => {
        switch(type) {
            case 'CAR': return <Car size={24} />;
            case 'BUS': return <Truck size={24} />;
            
            default: return <Bike size={24} />;
        }
    };

    if (loading) return <div className="p-5 text-center">Loading Assets...</div>;

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold">Insured Objects</h3>
                <button className="btn btn-primary d-flex align-items-center" onClick={() => setShowForm(!showForm)}>
                    <Plus size={18} className="me-2" /> Add New Asset
                </button>
            </div>

            {showForm && (
                <div className="card border-0 shadow-sm p-4 mb-4 animate-fade-in">
                    <h5 className="mb-3">Asset Details</h5>
                    <form onSubmit={handleAdd} className="row g-3">
                        <div className="col-md-3">
                            <label className="form-label small">Type</label>
                            <select className="form-select" value={form.objectType} onChange={e => setForm({...form, objectType: e.target.value})}>
                                <option value="BIKE">BIKE</option>
                                <option value="CAR">CAR</option>
                                <option value="BUS">BUS</option>
                                <option value="AUTO">AUTO</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small">Make</label>
                            <input className="form-control" value={form.make} placeholder="Toyota" onChange={e => setForm({...form, make: e.target.value})} required />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small">Model</label>
                            <input className="form-control" value={form.model} placeholder="Camry" onChange={e => setForm({...form, model: e.target.value})} required />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small">Year</label>
                            <input className="form-control" value={form.year} placeholder="2024" onChange={e => setForm({...form, year: e.target.value})} required />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small">Market Value</label>
                            <input type="number" className="form-control" value={form.value} placeholder="50000" onChange={e => setForm({...form, value: e.target.value})} required />
                        </div>
                        <div className="col-12 text-end mt-3">
                            <button type="button" className="btn btn-light me-2" onClick={() => setShowForm(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary">Submit for Review</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="row g-4">
                {objects.length > 0 ? objects.map((obj, i) => (
                    <div key={obj.objectId || i} className="col-md-4">
                        <div className="card border-0 shadow-sm h-100 asset-card">
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className="p-3 bg-primary-soft text-primary rounded-3" style={{backgroundColor: '#e7f1ff'}}>
                                        {getIcon(obj.objectType)}
                                    </div>
                                    <span className="badge bg-success-subtle text-success rounded-pill px-3">Insured</span>
                                </div>
                                <h5 className="fw-bold mb-1">{obj.detailsJson?.make} {obj.detailsJson?.model}</h5>
                                <p className="text-muted small mb-3">Year: {obj.detailsJson?.year}</p>
                                
                                <div className="border-top pt-3 mt-3">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted small">Insured Value</span>
                                        <span className="fw-bold text-dark">₹{obj.detailsJson?.marketValue || '0'}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted small">Coverage Status</span>
                                        <span className="text-success small d-flex align-items-center">
                                            <ShieldCheck size={14} className="me-1"/> Active
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )) : !showForm && (
                    <div className="col-12 text-center p-5 bg-white rounded shadow-sm">
                        <div className="text-muted mb-3"><ShieldCheck size={48} /></div>
                        <h5>No Insured Objects Found</h5>
                        <p className="text-muted">Register your first asset to start coverage.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
export default InsuredObjects;