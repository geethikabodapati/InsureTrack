import React, { useState, useEffect, useCallback } from 'react';
import { getAllCustomers, updateCustomer } from '../../../core/services/api';

const Customers = () => {
    const [profile, setProfile] = useState({ name: '', dob: '', contactInfo: '', segment: 'RETAIL' });
    const [loading, setLoading] = useState(true);
    const userId = localStorage.getItem("userId");

    // Fetch profile and match by userId
    const loadProfile = useCallback(async () => {
        try {
            const res = await getAllCustomers();
            const myData = res.data.find(c => c.userId === parseInt(userId));
            if (myData) {
                setProfile(myData);
                localStorage.setItem("customerId", myData.customerId);
            }
        } catch (err) {
            console.error("Sync Error", err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => { loadProfile(); }, [loadProfile]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const cid = localStorage.getItem("customerId");
        try {
            await updateCustomer(cid, profile);
            alert("Profile Updated!");
        } catch (err) {
            alert("Update failed");
        }
    };

    if (loading) return <div className="p-5 text-center">Loading Profile...</div>;

    return (
        <div className="card border-0 shadow-sm p-4">
            <h4 className="fw-bold mb-4">Customer Information</h4>
            <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-md-6">
                    <label className="form-label small text-muted">Full Name</label>
                    <input className="form-control" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
                </div>
                <div className="col-md-6">
                    <label className="form-label small text-muted">Date of Birth</label>
                    <input type="date" className="form-control" value={profile.dob} onChange={e => setProfile({...profile, dob: e.target.value})} />
                </div>
                <div className="col-12">
                    <label className="form-label small text-muted">Contact Info</label>
                    <input className="form-control" value={profile.contactInfo} onChange={e => setProfile({...profile, contactInfo: e.target.value})} />
                </div>
                <div className="col-12 mt-4">
                    <button className="btn btn-primary px-4 py-2 shadow-sm border-0">Update Profile</button>
                </div>
            </form>
        </div>
    );
};
export default Customers;