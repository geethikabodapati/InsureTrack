import React, { useState, useEffect } from 'react';
import {
    FiSearch, FiPlay, FiSend,
    FiChevronLeft, FiChevronRight, FiShield, FiCheckCircle, FiX
} from "react-icons/fi";
import {
    getAllQuotes,
    rateQuote,
    submitQuote,
    issuePolicy,
    updateInsuredObject
} from '../../../core/services/api.js';

const QuoteManagement = () => {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [notification, setNotification] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // --- Modal & Rating State ---
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [ratingData, setRatingData] = useState({ valuation: "", riskScore: "1" });

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const response = await getAllQuotes();
            setQuotes(response.data || []);
        } catch (error) {
            console.error("Error loading quotes:", error);
            showToast("Error connecting to server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    // --- Pagination & Search Logic ---
    // Updated to include status in the search filter
    const filteredQuotes = quotes.filter(q =>
        q.quoteId.toString().includes(searchTerm) ||
        (q.customerName && q.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (q.status && q.status.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage) || 1;
    const currentItems = filteredQuotes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // --- Action Handlers ---
    const openRatingModal = (quote) => {
        setSelectedQuote(quote);
        setRatingData({ valuation: quote.premium || "", riskScore: "1" });
        setShowRatingModal(true);
    };

   const handleSubmitRating = async () => {
       try {
           const objectId = selectedQuote.insuredObjectId || selectedQuote.quoteId;

           console.log("Updating Object ID:", objectId);

           // 1. Update Insured Object
           await updateInsuredObject(objectId, ratingData);

           // 2. Rate the Quote
           await rateQuote(selectedQuote.quoteId);

           showToast("Quote Rated Successfully!");
           setShowRatingModal(false);
           loadDashboardData();
       } catch (error) {
           console.error("Submission error:", error.response?.data || error.message);
           showToast("Rating failed: " + (error.response?.data?.message || "Server Error"));
       }
   };

    const handleSubmit = async (id) => {
        try {
            await submitQuote(id);
            showToast("Submitted for Underwriting!");
            loadDashboardData();
        } catch (error) { showToast("Submission failed"); }
    };

    const handleIssuePolicy = async (quoteId) => {
        try {
            await issuePolicy(quoteId);
            showToast("Policy Issued Successfully!");
            loadDashboardData();
        } catch (error) { showToast("Could not issue policy"); }
    };

    const getStatusStyle = (status) => {
        switch (status?.toUpperCase()) {
            case 'APPROVED': return 'status-approved';
            case 'DRAFT': return 'status-draft';
            case 'RATED': return 'status-rated';
            case 'SUBMITTED': return 'status-submitted';
            case 'ISSUED': return 'status-approved';
            default: return 'status-default';
        }
    };

    const showToast = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    if (loading) return <div className="p-6 text-center">Loading dashboard data...</div>;

    return (
        <div className="management-container">
            {notification && <div className="toast-notification">{notification}</div>}
            <div className="management-header"><h2>Quote Management</h2></div>

            <div className="table-controls">
                <div className="search-wrapper">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search ID, Name, or Status..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                </div>
            </div>

            <div className="table-responsive">
                <table className="management-table">
                    <thead>
                        <tr>
                            <th>QUOTE ID</th>
                            <th>CUSTOMER NAME</th>
                            <th>PREMIUM</th>
                            <th>STATUS</th>
                            <th>CREATED DATE</th>
                            <th style={{ textAlign: 'left' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((quote) => (
                                <tr key={quote.quoteId}>
                                    <td className="quote-id-cell">Q-{quote.quoteId}</td>
                                    <td>{quote.customerName || "N/A"}</td>
                                    <td className="premium-cell">
                                        {quote.premium ? `${quote.premium.toLocaleString()}` : <span className="text-muted">Pending</span>}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusStyle(quote.status)}`}>
                                            {quote.status}
                                        </span>
                                    </td>
                                    <td>{new Date(quote.createdDate).toLocaleDateString()}</td>
                                    <td className="actions-cell">
                                        <div className="actions-wrapper" style={{ display: 'flex', justifyContent: 'center', minHeight: '32px', alignItems: 'center' }}>
                                            {quote.status === 'DRAFT' && (
                                                <button
                                                    onClick={() => openRatingModal(quote)}
                                                    className="btn-icon-table"
                                                    style={{ backgroundColor: '#e0f2fe', color: '#0369a1', border: 'none' }}
                                                >
                                                    <FiPlay /> Rate
                                                </button>
                                            )}
                                            {quote.status === 'RATED' && (
                                                <button onClick={() => handleSubmit(quote.quoteId)} className="btn-icon-table btn-submit">
                                                    <FiSend /> Submit
                                                </button>
                                            )}
                                            {quote.status === 'SUBMITTED' && (
                                                <span className="action-text status-submitted" style={{ fontSize: '12px', fontWeight: '600' }}>
                                                    Under Review
                                                </span>
                                            )}
                                            {quote.status === 'APPROVED' && (
                                                <button onClick={() => handleIssuePolicy(quote.quoteId)} className="btn-icon-table btn-issue">
                                                    <FiShield /> Issue Policy
                                                </button>
                                            )}
                                            {quote.status === 'ISSUED' && (
                                                <span className="action-text status-approved" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <FiCheckCircle /> Policy Active
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                    No records found matching "{searchTerm}"
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="management-footer">
                <div className="pagination-info">Page {currentPage} of {totalPages}</div>
                <div className="pagination-controls">
                    <button className="btn-icon-pagi" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><FiChevronLeft /></button>
                    <button className="btn-icon-pagi active-pagi">{currentPage}</button>
                    <button className="btn-icon-pagi" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><FiChevronRight /></button>
                </div>
            </div>

            {/* Rating Modal */}
            {showRatingModal && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="modal-content" style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '350px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0 }}>Rate Quote Q-{selectedQuote?.quoteId}</h3>
                            <button onClick={() => setShowRatingModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FiX size={20} /></button>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', fontWeight: '600' }}>Valuation</label>
                            <input
                                type="number"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                value={ratingData.valuation}
                                onChange={(e) => setRatingData({...ratingData, valuation: e.target.value})}
                                placeholder="60000"
                            />
                        </div>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', fontWeight: '600' }}>Risk Score (1-10)</label>
                            <select
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                                value={ratingData.riskScore}
                                onChange={(e) => setRatingData({...ratingData, riskScore: e.target.value})}
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                        <button
                            onClick={handleSubmitRating}
                            className="btn-primary"
                            style={{ width: '100%', backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '10px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                        >
                            Submit Rating
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuoteManagement;