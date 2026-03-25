import React from 'react';
import  Overview  from './Overview'; // The stats cards from previous step
import { CreditCard } from 'lucide-react';
import '../styles/overview.css';

const DashboardHome = () => {
    const claims = [
        { id: 'CLM-2024-001', type: 'Health Insurance', desc: 'Medical treatment for injury', amt: '$3,500', status: 'Approved', date: '2024-02-15' },
        { id: 'CLM-2024-002', type: 'Auto Insurance', desc: 'Vehicle accident repair', amt: '$5,200', status: 'Processing', date: '2024-03-01' },
    ];

    const payments = [
        { type: 'Health Insurance', id: 'POL-001', date: '2024-03-15', amt: '$450', status: 'Paid' },
        { type: 'Auto Insurance', id: 'POL-002', date: '2024-03-01', amt: '$180', status: 'Paid' },
    ];

    return (
        <div>
            <Overview /> {/* Stats cards here */}

            <div className="row g-4 mt-2">
                {/* RECENT CLAIMS */}
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold mb-0">Recent Claims</h5>
                            <button className="btn btn-link text-decoration-none p-0">View all</button>
                        </div>
                        <div className="list-group list-group-flush">
                            {claims.map((c, i) => (
                                <div key={i} className="list-group-item px-0 border-light py-3">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <div className="d-flex align-items-center mb-1">
                                                <span className="fw-bold me-2">{c.id}</span>
                                                <span className={`badge rounded-pill ${c.status === 'Approved' ? 'badge-approved' : 'badge-processing'}`}>
                                                    {c.status}
                                                </span>
                                            </div>
                                            <small className="text-muted d-block">{c.desc}</small>
                                            <small className="text-muted" style={{fontSize: '11px'}}>{c.date}</small>
                                        </div>
                                        <div className="fw-bold text-dark">{c.amt}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* UPCOMING PAYMENTS */}
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold mb-0">Upcoming Payments</h5>
                            <button className="btn btn-link text-decoration-none p-0">View all</button>
                        </div>
                        <div className="list-group list-group-flush">
                            {payments.map((p, i) => (
                                <div key={i} className="list-group-item px-0 border-light py-3 d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-light p-2 rounded me-3 text-primary"><CreditCard size={18}/></div>
                                        <div>
                                            <div className="fw-bold" style={{fontSize: '14px'}}>{p.type}</div>
                                            <small className="text-muted">{p.id} • Due: {p.date}</small>
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <div className="fw-bold">{p.amt}</div>
                                        <span className="badge bg-success-soft text-success rounded-pill" style={{fontSize: '10px'}}>Paid</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;