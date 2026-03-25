import React, { useState, useEffect } from 'react';
import API from '../../../core/services/api';
import { FileText, Activity, Shield, DollarSign, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
 
const Overview = () => {
    const [stats, setStats] = useState({
        activePolicies: 0,
        pendingClaims: 0,
        totalPremium: 0,
        nextPayment: 0
    });
    const [recentClaims, setRecentClaims] = useState([]);
    const [distribution, setDistribution] = useState({ car: 25, bike: 25, bus: 25, auto: 25 });
    const [loading, setLoading] = useState(true);
    const customerId = localStorage.getItem("customerId");
 
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Fetch Policies
                const policyRes = await API.get(`/agent/policies/customers/${customerId}`);
                const policies = policyRes.data;
 
                // 2. Fetch Invoices for Next Due
                const invoicePromises = policies.map(p =>
                    API.get(`/analyst/billing/policies/${p.policyId}/invoices`)
                );
                const invoiceResponses = await Promise.all(invoicePromises);
                let allInvoices = [];
                invoiceResponses.forEach(res => { if(res.data) allInvoices = [...allInvoices, ...res.data]; });
 
                // 3. Fetch Claims (Endpoint includes /adjuster to match your Java Controller)
                const claimsRes = await API.get(`/adjuster/claims/customers/${customerId}`);
                const claims = claimsRes.data;
 
                // --- DATA PROCESSING ---
                let totalPremiumSum = 0;
                const counts = { car: 0, bike: 0, bus: 0, auto: 0 };
 
                policies.forEach(p => {
                    totalPremiumSum += p.premium || 0;
                    const num = p.policyNumber?.toLowerCase() || "";
                    if (num.includes('car')) counts.car++;
                    else if (num.includes('bk')) counts.bike++;
                    else if (num.includes('bs')) counts.bus++;
                    else counts.auto++;
                });
 
                const pendingInvoice = allInvoices.find(inv => inv.status === 'OPEN' || inv.status === 'PENDING');
 
                // UPDATE STATS: c.status === 'OPEN' matches your MySQL screenshot
                setStats({
                    activePolicies: policies.filter(p => p.status === 'ACTIVE').length,
                    pendingClaims: claims.filter(c => c.status === 'OPEN').length,
                    totalPremium: totalPremiumSum,
                    nextPayment: pendingInvoice ? pendingInvoice.amount : 0
                });
 
                setRecentClaims(claims);
               
                const totalPolicies = policies.length || 1;
                setDistribution({
                    car: (counts.car / totalPolicies) * 100,
                    bike: (counts.bike / totalPolicies) * 100,
                    bus: (counts.bus / totalPolicies) * 100,
                    auto: (counts.auto / totalPolicies) * 100,
                });
 
            } catch (err) {
                console.error("Dashboard Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
 
        if (customerId) fetchDashboardData();
    }, [customerId]);
 
    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100 text-primary">
            <Loader2 className="animate-spin me-2" size={32} /> <strong>Loading Dashboard...</strong>
        </div>
    );
 
    return (
        <div className="container-fluid py-4 bg-light min-vh-100">
            <div className="mb-4">
                <h2 className="fw-bold text-dark">Dashboard Overview</h2>
                <p className="text-muted">Welcome back! Here is your insurance summary.</p>
            </div>
 
            {/* STAT CARDS */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-3 h-100 border-start border-4 border-primary">
                        <div className="d-flex justify-content-between">
                            <div>
                                <small className="text-muted fw-bold text-uppercase" style={{fontSize: '11px'}}>Active Policies</small>
                                <h3 className="fw-bold mt-1">{stats.activePolicies}</h3>
                            </div>
                            <div className="p-2 rounded bg-primary bg-opacity-10 text-primary"><Shield /></div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-3 h-100 border-start border-4 border-warning">
                        <div className="d-flex justify-content-between">
                            <div>
                                <small className="text-muted fw-bold text-uppercase" style={{fontSize: '11px'}}>Pending Claims</small>
                                <h3 className="fw-bold mt-1 text-warning">{stats.pendingClaims}</h3>
                            </div>
                            <div className="p-2 rounded bg-warning bg-opacity-10 text-warning"><Activity /></div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-3 h-100 border-start border-4 border-success">
                        <div className="d-flex justify-content-between">
                            <div>
                                <small className="text-muted fw-bold text-uppercase" style={{fontSize: '11px'}}>Total Premium</small>
                                <h3 className="fw-bold mt-1">₹{stats.totalPremium.toLocaleString()}</h3>
                            </div>
                            <div className="p-2 rounded bg-success bg-opacity-10 text-success"><FileText /></div>
                        </div>
                    </div>
                </div>
                {/* <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-3 h-100 border-start border-4 border-danger">
                        <div className="d-flex justify-content-between">
                            <div>
                                <small className="text-muted fw-bold text-uppercase" style={{fontSize: '11px'}}>Next Due</small>
                                <h3 className="fw-bold mt-1 text-danger">₹{stats.nextPayment.toLocaleString()}</h3>
                            </div>
                            <div className="p-2 rounded bg-danger bg-opacity-10 text-danger"><DollarSign /></div>
                        </div>
                    </div>
                </div> */}
            </div>
 
            <div className="row g-4">
                {/* RECENT CLAIMS - CUSTOM UI MATCHING YOUR SCREENSHOT */}
                <div className="col-md-7">
                    <div className="card border-0 shadow-sm p-4 h-100">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold mb-0">Recent Claims</h5>
                            <button className="btn btn-link btn-sm text-primary text-decoration-none fw-bold">View all</button>
                        </div>
                       
                        <div className="claims-list">
                            {recentClaims.length > 0 ? (
                                recentClaims.map((claim, index) => (
                                    <div key={claim.claimId} className={`d-flex justify-content-between align-items-center py-3 ${index !== recentClaims.length - 1 ? 'border-bottom' : ''}`}>
                                        <div>
                                            <div className="fw-bold text-dark">CLM-2026-00{claim.claimId}</div>
                                            <div className="text-muted small">{claim.description || "No description provided"}</div>
                                            <div className="text-muted mt-1" style={{fontSize: '12px'}}>{claim.incidentDate}</div>
                                        </div>
                                        <div className="text-end">
                                            <div className="fw-bold text-dark">₹{claim.claimAmount ? claim.claimAmount.toLocaleString() : '0'}</div>
                                            {/* Status Badge to keep track of the OPEN status */}
                                            <span className={`badge rounded-pill mt-1 ${claim.status === 'OPEN' ? 'bg-warning text-dark' : 'bg-success'}`} style={{fontSize: '10px'}}>
                                                {claim.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-muted">
                                    <AlertCircle className="mx-auto mb-2 opacity-50" />
                                    <p>No claims found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
 
                {/* DISTRIBUTION / QUICK ACTIONS */}
                <div className="col-md-5">
                    <div className="card border-0 shadow-sm p-4 h-100">
                        <h5 className="fw-bold mb-4">Policy Distribution</h5>
                        <div className="d-flex align-items-center justify-content-center flex-column">
                            <div className="rounded-circle"
                                 style={{
                                     width: '140px',
                                     height: '140px',
                                     background: `conic-gradient(#0d6efd 0% ${distribution.car}%, #6f42c1 ${distribution.car}% ${distribution.car + distribution.bike}%, #198754 ${distribution.car + distribution.bike}% ${distribution.car + distribution.bike + distribution.bus}%, #ffc107 ${distribution.car + distribution.bike + distribution.bus}% 100%)`
                                 }}>
                            </div>
                            <div className="mt-4 w-100">
                                <div className="d-flex justify-content-between py-2 border-bottom small">
                                    <span><span className="text-primary me-2">●</span> Car Insurance</span>
                                    <span className="fw-bold">{Math.round(distribution.car)}%</span>
                                </div>
                                <div className="d-flex justify-content-between py-2 border-bottom small">
                                    <span><span className="text-purple me-2" style={{color: '#6f42c1'}}>●</span> Bike Insurance</span>
                                    <span className="fw-bold">{Math.round(distribution.bike)}%</span>
                                </div>
                                <div className="d-flex justify-content-between py-2 small">
                                    <span><span className="text-warning me-2">●</span> Others</span>
                                    <span className="fw-bold">{Math.round(distribution.bus + distribution.auto)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
 
export default Overview;