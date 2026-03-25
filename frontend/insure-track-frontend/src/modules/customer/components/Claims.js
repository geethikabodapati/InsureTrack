import React, { useState, useEffect } from 'react';
import API from '../../../core/services/api';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
 
const Claims = () => {
    const [policies, setPolicies] = useState([]); // To populate a dropdown
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({
        policyId: '',
        incidentDate: '',
        claimType: '',
        description: ''
    });
 
    const customerId = localStorage.getItem("customerId");
 
    useEffect(() => {
        // Fetch policies so the user can choose which one to claim against
        API.get(`/agent/policies/customers/${customerId}`).then(res => setPolicies(res.data));
    }, [customerId]);
 
    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
       
        // Append the JSON data as a String blob
        data.append("claim", JSON.stringify(formData));
        // Append the actual file
        data.append("file", file);
 
        try {
            await API.post('/adjuster/claims/submit', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Claim submitted successfully!");
        } catch (err) {
            console.error(err);
            alert("Error submitting claim");
        }
    };
 
    return (
        <div className="container mt-4">
            <div className="card shadow-sm p-4">
                <h3 className="text-primary mb-4">File a New Claim</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Select Policy</label>
                        <select className="form-select" onChange={e => setFormData({...formData, policyId: e.target.value})} required>
                            <option value="">-- Choose Policy --</option>
                            {policies.map(p => <option key={p.policyId} value={p.policyId}>{p.policyNumber}</option>)}
                        </select>
                    </div>
 
                    <div className="row">
                        <div className="col-md-6 mb-3">
    <label className="form-label fw-bold">Incident Date</label>
    <input
        type="date"
        className="form-control border-2 shadow-sm py-2"
        style={{ borderRadius: '10px' }}
        // Sets the maximum selectable date to exactly right now
        max={new Date().toISOString().split("T")[0]}
        onChange={e => {
            const selectedDate = e.target.value;
            const today = new Date().toISOString().split("T")[0];
           
            // Double-check validation in case of manual typing
            if (selectedDate > today) {
                alert("Incident date cannot be in the future.");
                e.target.value = "";
            } else {
                setFormData({...formData, incidentDate: selectedDate});
            }
        }}
        required
    />
    <div className="form-text small text-muted">Future dates are disabled.</div>
</div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Claim Type</label>
                            <select className="form-select" onChange={e => setFormData({...formData, claimType: e.target.value})}>
                                <option value="AUTO">AUTO</option>
                                <option value="BIKE">BIKE</option>
                                <option value="CAR">CAR</option>
                                <option value="BUS">BUS</option>
                            </select>
                        </div>
                    </div>
 
                    <div className="mb-3">
    <div className="d-flex justify-content-between">
        <label className="form-label fw-bold">Description</label>
        <span className={`small fw-bold ${formData.description?.trim().split(/\s+/).filter(Boolean).length > 100 ? 'text-danger' : 'text-muted'}`}>
            {formData.description?.trim().split(/\s+/).filter(Boolean).length || 0} / 50 words
        </span>
    </div>
   
    <textarea
        className="form-control border-2 shadow-sm"
        rows="4"
        value={formData.description}
        onChange={e => {
            const text = e.target.value;
            const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
           
            // Validation: Only update state if word count is <= 100
            if (wordCount <= 50 || text.length < formData.description.length) {
                setFormData({...formData, description: text});
            }
        }}
        placeholder="Describe what happened..."
        style={{ borderRadius: '10px' }}
    ></textarea>
</div>
 
                    <div className="mb-4">
    <div className="d-flex justify-content-between">
        <label className="form-label fw-bold">Upload Evidence (Photo/Document)</label>
        <span className="small text-muted fw-bold">Max: 2MB</span>
    </div>
   
    <input
        type="file"
        className="form-control border-2 shadow-sm py-2"
        style={{ borderRadius: '10px' }}
        onChange={e => {
            const file = e.target.files[0];
            if (file) {
                const fileSizeInMB = file.size / (1024 * 1024);
                if (fileSizeInMB > 2) {
                    alert("This file is too large! Please select a file smaller than 2MB.");
                    e.target.value = ""; // Clear the input so the invalid file isn't "selected"
                    setFile(null);
                } else {
                    setFile(file);
                }
            }
        }}
        required
    />
    <div className="form-text small">Supported formats: JPG, PNG, PDF</div>
</div>
 
                    <div className="d-flex justify-content-end mt-4">
    <button
        type="submit"
        className="btn btn-primary btn-lg fw-bold shadow-sm px-5 d-flex align-items-center"
    >
        <Upload size={20} className="me-2" />
        Submit
    </button>
</div>
                </form>
            </div>
        </div>
    );
};
 
export default Claims;