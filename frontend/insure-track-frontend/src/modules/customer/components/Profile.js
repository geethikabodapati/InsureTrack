import React, { useState, useEffect, useCallback } from 'react';
import { getAllCustomers, updateCustomer } from '../../../core/services/api';

const MyProfile = () => {
    const [profile, setProfile] = useState({ 
        name: '', dob: '', contactInfo: '', segment: 'RETAIL', status: 'INACTIVE' 
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
            console.log(myData.customerId);
            
            // SECURITY: If the DB says INACTIVE, force the lock in storage
            if (myData.status === 'ACTIVE') {
                localStorage.setItem("customerStatus", "ACTIVE");
            } else {
                localStorage.setItem("customerStatus", "INACTIVE");
            }
        } else {
            // No record found at all? Keep it locked.
            localStorage.setItem("customerStatus", "INACTIVE");
        }
    } catch (err) {
        console.error("Fetch Error", err);
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
                
                // UNLOCK LOGIC for Update
                localStorage.setItem("customerStatus", "ACTIVE");
                window.dispatchEvent(new Event("storage")); // Trigger Layout update
                
                alert("Profile Updated & System Unlocked!");
            // } else {
            //     const response = await createCustomer(userId, updatePayload);
            //     const newId = response.data.customerId;
                
            //     if (newId) {
            //         // 1. Update Storage with the keys the Layout is watching
            //         localStorage.setItem("customerId", newId);
            //         localStorage.setItem("customerStatus", "ACTIVE");
                    
            //         const updatedUser = { ...userData, role: 'CUSTOMER' }; 
            //         localStorage.setItem("user", JSON.stringify(updatedUser));

            //         // 2. TRIGGER THE SIGNAL
            //         window.dispatchEvent(new Event("storage")); 
            //     }

                alert("Account Activated! All sections are now open.");
                setIsExistingCustomer(true);
                loadProfile(); 
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