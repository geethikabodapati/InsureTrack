import React, { useState, useEffect } from 'react';
import API from '../../../core/services/api';
// Added XCircle and AlertTriangle for the Cancel UI
import { ShieldCheck, Calendar, Hash, CreditCard, Plus, X, Loader2, XCircle, AlertTriangle } from 'lucide-react';
 
const Policies = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
   
    // --- NEW STATES FOR CANCELLATION ---
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [cancelData, setCancelData] = useState({
        policyId: '',
        policyNumber: '',
        reason: ''
    });
 
    const today = new Date().toISOString().split("T")[0];
   
    const [endorsementData, setEndorsementData] = useState({
        policyId: '',
        changeType: 'ADD_COVERAGE',
        effectiveDate: today,
        premiumDelta: ''
    });
 
    const customerId = localStorage.getItem("customerId");
 
    useEffect(() => {
        const fetchPolicies = async () => {
            try {
                const response = await API.get(`/agent/policies/customers/${customerId}`);
                setPolicies(response.data);
            } catch (err) {
                console.error("Error fetching policies:", err);
            } finally {
                setLoading(false);
            }
        };
        if (customerId) fetchPolicies();
    }, [customerId]);
 
    // --- NEW HANDLER FOR CANCELLATION ---
    const handleOpenCancel = (policy) => {
        setCancelData({
            policyId: policy.policyId,
            policyNumber: policy.policyNumber,
            reason: ''
        });
        setShowCancelModal(true);
    };
 
    const handleCancelSubmit = async (e) => {
        e.preventDefault();
        setCancelling(true);
        try {
            // Adjust the URL to your specific backend endpoint
            await API.post('/customers/cancellation', {
                policyId: parseInt(cancelData.policyId),
                reason: cancelData.reason
            });
            alert("Cancellation Request Submitted!");
            setShowCancelModal(false);
        } catch (err) {
            alert("Failed to submit cancellation: " + (err.response?.data?.message || "Server Error"));
        } finally {
            setCancelling(false);
        }
    };
 
    const handleEndorsementSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await API.post('/customers/endorsements', {
                policyId: parseInt(endorsementData.policyId),
                changeType: endorsementData.changeType,
                effectiveDate: endorsementData.effectiveDate,
                premiumDelta: parseFloat(endorsementData.premiumDelta),
                status: 'PENDING'
            });
            alert("Endorsement Request Submitted Successfully!");
            setShowModal(false);
            setEndorsementData({ policyId: '', changeType: 'ADD_COVERAGE', effectiveDate: today, premiumDelta: '' });
        } catch (err) {
            console.error("Error saving endorsement:", err);
            alert("Failed to submit request.");
        } finally {
            setSubmitting(false);
        }
    };
 
    if (loading) return <div className="text-center p-5 fw-bold text-primary">Loading your policies...</div>;
 
    return (
        <div className="container mt-4 position-relative">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold text-primary m-0">My Active Policies</h3>
                <button
                    className="btn btn-primary d-flex align-items-center shadow-sm fw-bold px-4 py-2"
                    onClick={() => setShowModal(true)}
                    style={{ borderRadius: '10px' }}
                >
                    <Plus size={18} className="me-2" /> Add Endorsement
                </button>
            </div>
           
            {policies.length > 0 ? (
                <div className="row">
                    {policies.map((p) => (
                        <div className="col-md-12 mb-3" key={p.policyId}>
                            {/* card position-relative allows the button to sit in the corner */}
                            <div className="card shadow-sm border-start border-4 border-primary position-relative">
                               
                                {/* CANCEL BUTTON IN LEFT CORNER */}
                                <button
                                    className="btn btn-link text-danger position-absolute top-0 start-0 m-1 p-1 shadow-none"
                                    onClick={() => handleOpenCancel(p)}
                                    title="Request Cancellation"
                                >
                                    <XCircle size={22} />
                                </button>
 
                                <div className="card-body pt-4">
                                    <div className="d-flex justify-content-between align-items-start ms-4">
                                        <div>
                                            <h5 className="card-title fw-bold text-uppercase text-dark">{p.policyNumber}</h5>
                                            <p className="text-muted small">Quote Reference: #Q-{p.quoteId}</p>
                                        </div>
                                        <span className="badge bg-success-subtle text-success border border-success px-3 py-2">
                                            {p.status}
                                        </span>
                                    </div>
                                    <hr />
                                    <div className="row text-center">
                                        <div className="col-4">
                                            <p className="mb-0 text-muted small">Premium</p>
                                            <p className="fw-bold text-dark fs-5">₹{p.premium}</p>
                                        </div>
                                        <div className="col-4 border-start border-end">
                                            <p className="mb-0 text-muted small">Starts</p>
                                            <p className="fw-bold text-dark">{p.effectiveDate}</p>
                                        </div>
                                        <div className="col-4">
                                            <p className="mb-0 text-muted small">Expires</p>
                                            <p className="fw-bold text-dark">{p.expiryDate}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="alert alert-info shadow-sm border-0">No policies found for your account.</div>
            )}
 
            {/* ENDORSEMENT MODAL (Existing) */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px' }}>
                            <div className="modal-header bg-primary text-white" style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
                                <h5 className="modal-title fw-bold">Request Policy Endorsement</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleEndorsementSubmit}>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-uppercase">1. Select Policy</label>
                                        <select
                                            className="form-select border-2 py-2"
                                            required
                                            value={endorsementData.policyId}
                                            onChange={(e) => setEndorsementData({...endorsementData, policyId: e.target.value})}
                                        >
                                            <option value="">-- Choose Policy --</option>
                                            {policies.map(p => (
                                                <option key={p.policyId} value={p.policyId}>{p.policyNumber}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-uppercase">2. Change Type</label>
                                        <select
                                            className="form-select border-2 py-2"
                                            value={endorsementData.changeType}
                                            onChange={(e) => setEndorsementData({...endorsementData, changeType: e.target.value})}
                                        >
                                            <option value="ADD_COVERAGE">Add Coverage</option>
                                            <option value="REMOVE_COVERAGE">Remove Coverage</option>
                                            <option value="UPDATE_LIMITS">Update Limits</option>
                                        </select>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold small text-uppercase">Effective Date</label>
                                            <input
                                                type="date"
                                                className="form-control border-2 shadow-sm py-2"
                                                required
                                                value={endorsementData.effectiveDate}
                                                min={today}
                                                onChange={(e) => setEndorsementData({...endorsementData, effectiveDate: e.target.value})}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold small text-uppercase">Premium Delta (₹)</label>
                                            <input
                                                type="number"
                                                className="form-control border-2"
                                                placeholder="e.g. 5000"
                                                required
                                                value={endorsementData.premiumDelta}
                                                onChange={(e) => setEndorsementData({...endorsementData, premiumDelta: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 p-4 pt-0">
                                    <button type="button" className="btn btn-light fw-bold px-4" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary fw-bold px-5" disabled={submitting}>
                                        {submitting ? <Loader2 className="animate-spin me-2" size={18} /> : "Submit Request"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
 
            {/* --- NEW CANCELLATION MODAL --- */}
            {showCancelModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px' }}>
                            <div className="modal-header bg-danger text-white" style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
                                <h5 className="modal-title fw-bold">Cancel Policy Request</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCancelModal(false)}></button>
                            </div>
                            <form onSubmit={handleCancelSubmit}>
                                <div className="modal-body p-4">
                                    <div className="alert alert-warning border-0 small d-flex align-items-center">
                                        <AlertTriangle size={20} className="me-2 text-danger" />
                                        Cancellation requests are subject to approval.
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-uppercase text-muted">Policy Number</label>
                                        <input type="text" className="form-control bg-light border-0 fw-bold" value={cancelData.policyNumber} readOnly />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-uppercase">Reason for Cancellation</label>
                                        <textarea
                                            className="form-control border-2 shadow-none"
                                            rows="3"
                                            placeholder="Please describe why you wish to cancel..."
                                            required
                                            value={cancelData.reason}
                                            onChange={(e) => setCancelData({...cancelData, reason: e.target.value})}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 p-4 pt-0">
                                    <button type="button" className="btn btn-light fw-bold px-4" onClick={() => setShowCancelModal(false)}>Keep Policy</button>
                                    <button type="submit" className="btn btn-danger fw-bold px-5" disabled={cancelling}>
                                        {cancelling ? <Loader2 className="animate-spin me-2" size={18} /> : "Submit Request"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
 
export default Policies;