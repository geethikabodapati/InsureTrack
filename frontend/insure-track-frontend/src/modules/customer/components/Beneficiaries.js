import React, { useState, useEffect, useCallback } from 'react';
// FIX 1: Add getBeneficiaries and removeBeneficiary to the imports
import { addBeneficiary, getBeneficiaries } from '../../../core/services/api';
 
const Beneficiaries = () => {
    const [list, setList] = useState([]);
    const [form, setForm] = useState({ name: '', relationship: '', percentageShare: '' });
    const customerId = localStorage.getItem("customerId");
 
    const refreshList = useCallback(async () => {
        if (!customerId || customerId === "undefined" || customerId === "null") {
            console.warn("No valid Customer ID found");
            return;
        }
 
        try {
            const res = await getBeneficiaries(customerId);
            // FIX 2: Check your console (F12) to see if this prints an array!
            console.log("Backend returned:", res.data);
            setList(res.data || []);
        } catch (err) {
            console.error("Error fetching beneficiaries:", err);
        }
    }, [customerId]);
 
    useEffect(() => { refreshList(); }, [refreshList]);
 
    const handleAdd = async (e) => {
    e.preventDefault();
    try {
        await addBeneficiary(customerId, {
            ...form,
            relationship: form.relationship,
            // CHANGE THIS: percentageshare -> percentageShare
            percentageShare: parseFloat(form.percentageShare)
        });
        alert("Beneficiary added!");
        setForm({ name: '', relationship: '', percentageShare: '' });
        refreshList();
    } catch (err) {
        alert(err.response?.data?.message || "Failed to add beneficiary.");
    }
};
 
    // const handleDelete = async (id) => {
    //     if (!window.confirm("Remove this beneficiary?")) return;
    //     try {
    //         await removeBeneficiary(id);
    //         refreshList();
    //     } catch (err) {
    //         alert("Delete failed.");
    //     }
    // };
 
    return (
        <div className="row g-4 mt-2">
            <div className="col-md-4">
                <div className="card p-3 shadow-sm border-0">
                    <h6 className="fw-bold mb-3">Add Beneficiary</h6>
                    <form onSubmit={handleAdd}>
                        <input className="form-control mb-2" placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                        <input className="form-control mb-2" placeholder="Relationship" value={form.relationship} onChange={e => setForm({...form, relationship: e.target.value})} required />
                        <input type="number" className="form-control mb-3" placeholder="Share %" value={form.percentageShare} onChange={e => setForm({...form, percentageShare: e.target.value})} required />
                        <button className="btn btn-success w-40 ">Save</button>
                    </form>
                </div>
            </div>
 
            <div className="col-md-8">
                <div className="card p-3 shadow-sm border-0">
                    <h6 className="fw-bold mb-3">Current Beneficiaries</h6>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Name</th>
                                    <th>Relationship</th>
                                    <th>Share</th>
                                   
                                </tr>
                            </thead>
                            <tbody>
                                {list.length > 0 ? (
                                    list.map((b) => (
                                        <tr key={b.beneficiaryId}>
                                            <td className="fw-semibold">{b.name}</td>
                                            {/* FIX 3: Use b.relationship (matches your Java Record) */}
                                            <td>{b.relationship}</td>
                                            <td>{b.percentageShare}%</td>
                                           
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="4" className="text-center py-4 text-muted">No beneficiaries found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
 
export default Beneficiaries;