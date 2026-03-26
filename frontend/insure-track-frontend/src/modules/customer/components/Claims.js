import React, { useState, useEffect } from 'react';
import API from '../../../core/services/api';
import { getInvoicesByPolicy } from '../../../core/services/api'; 
import { Upload, Calendar, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const Claims = () => {
    const [policies, setPolicies] = useState([]); 
    const [file, setFile] = useState(null);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [isValidating, setIsValidating] = useState(false);
    const [paymentError, setPaymentError] = useState(""); 
    
    const [formData, setFormData] = useState({
        policyId: '',
        incidentDate: '',
        claimType: 'ACCIDENT',
        description: ''
    });

    const customerId = localStorage.getItem("customerId");

    useEffect(() => {
        API.get(`/agent/policies/customers/${customerId}`)
            .then(res => setPolicies(res.data))
            .catch(err => console.error("Error fetching policies", err));
    }, [customerId]);

    const handlePolicyChange = async (e) => {
        const id = e.target.value;
        
        // Reset states if user manually selects the empty option
        if (!id) {
            setSelectedPolicy(null);
            setPaymentError("");
            setFormData(prev => ({...prev, policyId: ''}));
            return;
        }

        setIsValidating(true);
        setPaymentError("");
        setSelectedPolicy(null); 

        try {
            const res = await getInvoicesByPolicy(id);
            const invoices = res.data || [];

            const isPaid = invoices.some(inv => 
                ['PAID', 'COMPLETED', 'SUCCESS'].includes(String(inv.status).toUpperCase())
            );

            if (!isPaid) {
                setPaymentError("Claim Blocked: No record of a PAID invoice for this policy.");
                // CRITICAL FIX: Reset the policyId in formData so the dropdown resets to empty
                setFormData(prev => ({...prev, policyId: ''})); 
            } else {
                const pol = policies.find(p => String(p.policyId) === id);
                setSelectedPolicy(pol);
                // Update policyId and reset date for a fresh start
                setFormData(prev => ({...prev, policyId: id, incidentDate: ''}));
            }
        } catch (err) {
            console.error("Invoice check failed", err);
            setPaymentError("Unable to verify payment status.");
            setFormData(prev => ({...prev, policyId: ''})); // Reset dropdown on API error too
        } finally {
            setIsValidating(false);
        }
    };

    const today = new Date().toISOString().split("T")[0];
    const minDate = selectedPolicy?.effectiveDate ? selectedPolicy.effectiveDate.split("T")[0] : "";

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return alert("Please upload evidence file");

        const data = new FormData();
        data.append("claim", JSON.stringify(formData));
        data.append("file", file);

        try {
            await API.post('/adjuster/claims/submit', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Claim submitted successfully!");
            setFormData({ policyId: '', incidentDate: '', claimType: 'ACCIDENT', description: '' });
            setFile(null);
            setSelectedPolicy(null);
        } catch (err) {
            alert(err.response?.data?.message || "Error submitting claim");
        }
    };

    return (
        <div className="container mt-4">
            <div className="card shadow-lg p-4 border-0" style={{ borderRadius: '20px' }}>
                <div className="d-flex align-items-center mb-4">
                    <CheckCircle2 className="text-primary me-2" size={28} />
                    <h3 className="fw-bold mb-0">Request a Claim</h3>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="form-label fw-bold">Select Active Policy</label>
                        <div className="position-relative">
                            <select 
                                className={`form-select border-2 py-2 ${paymentError ? 'is-invalid border-danger' : ''}`}
                                // Ensure value is tied to formData so it can be reset programmatically
                                value={formData.policyId}
                                onChange={handlePolicyChange} 
                                required
                            >
                                <option value="">-- Choose a Policy to verify --</option>
                                {policies.map(p => (
                                    <option key={p.policyId} value={p.policyId}>
                                        {p.policyNumber} — {p.status}
                                    </option>
                                ))}
                            </select>
                            {isValidating && (
                                <div className="position-absolute top-50 end-0 translate-middle-y me-5">
                                    <Loader2 className="animate-spin text-primary" size={20} />
                                </div>
                            )}
                        </div>
                    </div>

                    {paymentError && (
                        <div className="alert alert-danger border-0 shadow-sm d-flex align-items-center mb-4 animate__animated animate__shakeX">
                            <AlertCircle className="me-2" />
                            <div>{paymentError}</div>
                        </div>
                    )}

                    {selectedPolicy && !isValidating && (
                        <div className="p-3 bg-light rounded-4 animate__animated animate__fadeIn border">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Incident Date</label>
                                    <input
                                        type="date"
                                        className="form-control border-2 shadow-sm"
                                        min={minDate}
                                        max={today}
                                        value={formData.incidentDate}
                                        onChange={e => setFormData({...formData, incidentDate: e.target.value})}
                                        required
                                    />
                                    <div className="form-text text-primary">
                                        <Calendar size={14} className="me-1" />
                                        Coverage: {minDate} to {today}
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Type of Loss</label>
                                    <select className="form-select border-2 shadow-sm" value={formData.claimType} onChange={e => setFormData({...formData, claimType: e.target.value})}>
                                        <option value="ACCIDENT">ACCIDENT</option>
                                        <option value="NATURAL_CALAMITY">NATURAL CALAMITY</option>
                                        <option value="FIRE_ACCIDENT">FIRE ACCIDENT</option>
                                        <option value="THEFT">THEFT</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-3 mb-3">
                                <label className="form-label fw-bold">Detailed Description</label>
                                <textarea
                                    className="form-control border-2 shadow-sm"
                                    rows="3"
                                    placeholder="Explain the incident in detail..."
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    required
                                ></textarea>
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-bold">Upload Evidence</label>
                                <input 
                                    type="file" 
                                    className="form-control border-2 shadow-sm" 
                                    onChange={e => setFile(e.target.files[0])} 
                                    required 
                                />
                            </div>

                            <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold shadow-sm">
                                Submit Claim Request
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Claims;