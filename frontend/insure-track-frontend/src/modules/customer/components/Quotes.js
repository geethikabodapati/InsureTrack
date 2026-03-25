import React, { useState, useEffect } from 'react';
import { getCustomerQuotes } from '../../../core/services/api';
import { FileText, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const Quotes = () => {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const customerId = localStorage.getItem("customerId");
 
    useEffect(() => {
        const fetchQuotes = async () => {
            try {
                const response = await getCustomerQuotes(customerId);
                setQuotes(response.data || []);
            } catch (err) {
                console.error("Error fetching quotes:", err);
            } finally {
                setLoading(false);
            }
        };
        if (customerId) fetchQuotes();
    }, [customerId]);
 
    const getStatusBadge = (status) => {
        const base = "badge rounded-pill px-3 py-2 ";
        switch (status) {
            case 'DRAFT': return base + "bg-secondary-subtle text-secondary";
            case 'RATED': return base + "bg-info-subtle text-info";
            case 'BOUND': return base + "bg-success-subtle text-success";
            default: return base + "bg-light text-dark";
        }
    };
 
    if (loading) return <div className="p-5 text-center"><Loader2 className="spinner-border text-primary" /></div>;
 
    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold">My Insurance Quotes</h3>
                <span className="text-muted">{quotes.length} Quotes Found</span>
            </div>
 
            {quotes.length > 0 ? (
                <div className="card border-0 shadow-sm">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4">Quote ID</th>
                                    <th>Asset Type</th>
                                    <th>Premium</th>
                                    <th>Status</th>
                                   
                                </tr>
                            </thead>
                            <tbody>
                                {quotes.map((q) => (
                                    <tr key={q.quoteId}>
                                        <td className="ps-4 fw-semibold">#Q-{q.quoteId}</td>
                                        <td>{q.objectType || 'Vehicle'}</td>
                                        <td className="fw-bold text-primary">
                                            {q.premium ? `₹${q.premium.toLocaleString()}` : 'Calculating'}
                                        </td>
                                        <td><span className={getStatusBadge(q.status)}>{q.status}</span></td>
                                       
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-5 bg-light rounded-4 border-dashed border-2">
                    <FileText size={48} className="text-muted mb-3 opacity-50" />
                    <h5>No quotes found</h5>
                    <p className="text-muted">You haven't requested any insurance quotes yet.</p>
                </div>
            )}
        </div>
    );
};
 
export default Quotes;