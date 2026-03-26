import React, { useState, useEffect, useCallback } from 'react';
import { getAllCustomers, updateCustomer } from '../../../core/services/api';

const MyProfile = () => {
    const [profile, setProfile] = useState({ 
        name: '', dob: '', contactInfo: '', segment: 'CORPORATE', status: 'INACTIVE' 
    });
    const [isExistingCustomer, setIsExistingCustomer] = useState(false);
    const [loading, setLoading] = useState(true);

    const userJson = localStorage.getItem("user");
    const userData = userJson ? JSON.parse(userJson) : null;
    const userId = userData?.userId || userData?.id;

    const loadProfile = useCallback(async () => {
        if (!userId) return;
        try {
            setLoading(true);
            const res = await getAllCustomers();
            const myData = res.data.find(c => parseInt(c.userId || c.user?.id) === parseInt(userId));

            if (myData) {
                setProfile(myData);
                setIsExistingCustomer(true);
                localStorage.setItem("customerId", myData.customerId);
                
                const status = myData.status === 'ACTIVE' ? "ACTIVE" : "INACTIVE";
                localStorage.setItem("customerStatus", status);
            } else {
                // NEW USER: No record in DB yet
                setIsExistingCustomer(false);
                localStorage.setItem("customerStatus", "INACTIVE");
            }
            // Trigger layout update
            window.dispatchEvent(new Event("storage")); 
        } catch (err) {
            console.error("Fetch Error", err);
            localStorage.setItem("customerStatus", "INACTIVE");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => { loadProfile(); }, [loadProfile]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatePayload = { ...profile, status: 'ACTIVE' };
            
            if (isExistingCustomer) {
                const cid = profile.customerId || localStorage.getItem("customerId");
                await updateCustomer(cid, updatePayload);
                
                localStorage.setItem("customerStatus", "ACTIVE");
                window.dispatchEvent(new Event("storage")); 
                
                alert("Profile Updated & System Unlocked!");
                loadProfile(); 
            } else {
                // Logic for createCustomer would go here if needed
                alert("Account record not found. Please contact admin.");
            }
        } catch (err) {
            console.error("Submit Error:", err);
            alert("Failed to save. Check backend logs.");
        }
    };

    if (loading) return <div className="p-5 text-center">Checking Profile Status...</div>;

    return (
        <div className="container mt-4">
            <div className="card shadow p-4 border-0">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="mb-0">{isExistingCustomer ? "Customer Profile" : "Activate Your Account"}</h4>
                    <span className={`badge ${profile.status === 'ACTIVE' ? 'bg-success' : 'bg-warning'}`}>
                        {profile.status || 'INCOMPLETE'}
                    </span>
                </div>
                {!isExistingCustomer && (
                    <div className="alert alert-info py-2 small">
                        Please complete your details to unlock the dashboard.
                    </div>
                )}
                <form onSubmit={handleSubmit} className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label fw-bold small">Full Name</label>
                        <input className="form-control" value={profile.name || ''} onChange={e => setProfile({...profile, name: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label fw-bold small">Date of Birth</label>
                        <input type="date" className="form-control" value={profile.dob || ''} onChange={e => setProfile({...profile, dob: e.target.value})} required />
                    </div>
                    <div className="col-12">
                        <label className="form-label fw-bold small">Contact Details (Phone/Address)</label>
                        <input className="form-control" value={profile.contactInfo || ''} onChange={e => setProfile({...profile, contactInfo: e.target.value})} required />
                    </div>
                    <div className="col-12 mt-4">
                        <button type="submit" className="btn btn-primary w-100 py-2 shadow-sm">
                            {isExistingCustomer ? "Update & Keep Unlocked" : "Complete Profile & Unlock Everything"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MyProfile;