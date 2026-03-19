import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FiSearch, FiFilter, FiEye, FiPlay, FiSend, 
    FiMoreVertical, FiChevronLeft, FiChevronRight, FiShield,
    FiPlus, FiX // Added for Endorsement Modal
} from "react-icons/fi";
import '../styles/agentLayout.css'; 

const QuoteManagement = () => {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [notification, setNotification] = useState(null);

    // --- New States for Endorsement ---
    const [activePolicies, setActivePolicies] = useState([]); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [endorsementForm, setEndorsementForm] = useState({
        policyId: '',
        changeType: 'ADD_COVERAGE',
        premiumDelta: ''
    });

    const API_BASE_URL = 'http://localhost:8082/api/agent';
    const ENDORSEMENT_API = 'http://localhost:8082/api/customer/endorsements';

    const fetchQuotes = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/quotes`);
            setQuotes(response.data); 
        } catch (error) {
            console.error("Error fetching quotes:", error);
            showToast("Error connecting to server");
        } finally {
            setLoading(false);
        }
    };

    // --- New Fetch for Active Policies ---
    const fetchActivePolicies = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/policies`);
            // Only allow endorsements for ACTIVE policies
            setActivePolicies(response.data.filter(p => p.status === 'ACTIVE'));
        } catch (error) {
            console.error("Error fetching policies:", error);
        }
    };

    useEffect(() => {
        fetchQuotes();
        fetchActivePolicies();
    }, []);

    // --- New Endorsement Submission Handler ---
    const handleEndorsementSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(ENDORSEMENT_API, {
                ...endorsementForm,
                premiumDelta: parseFloat(endorsementForm.premiumDelta)
            });
            if (response.status === 200 || response.status === 201) {
                showToast("Endorsement Created Successfully!");
                setIsModalOpen(false);
                setEndorsementForm({ policyId: '', changeType: 'ADD_COVERAGE', premiumDelta: '' });
            }
        } catch (error) {
            console.error("Endorsement failed:", error);
            showToast("Failed to create endorsement");
        }
    };

    const handleRate = async (id) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/quotes/${id}/rate`);
            if (response.status === 200) {
                showToast("Quote Rated Successfully!");
                fetchQuotes(); 
            }
        } catch (error) {
            console.error("Rating failed:", error);
            showToast("Rating process failed");
        }
    };

    const handleSubmit = async (id) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/quotes/${id}/submit`);
            if (response.status === 200) {
                showToast("Quote Submitted to Underwriting!");
                fetchQuotes(); 
            }
        } catch (error) {
            console.error("Submission failed:", error);
            showToast("Submission failed");
        }
    };

    const handleIssuePolicy = async (quoteId) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/policies/issue`, { 
                quoteId: quoteId 
            });

            if (response.status === 200) {
                showToast("Policy Issued Successfully!");
                fetchQuotes(); 
            }
        } catch (error) {
            console.error("Policy issuance failed:", error);
            showToast("Could not issue policy");
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'APPROVED': return 'status-approved';
            case 'DRAFT': return 'status-draft';
            case 'RATED': return 'status-rated';
            case 'SUBMITTED': return 'status-submitted';
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
            {notification && (
                <div className="toast-notification">
                    {notification}
                </div>
            )}

            <div className="management-header">
                <h2>Quote Management</h2>
               
            </div>

            {/* --- NEW MODAL FOR ENDORSEMENT --- */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Create Policy Endorsement</h3>
                            <button className="close-modal" onClick={() => setIsModalOpen(false)}><FiX /></button>
                        </div>
                        <form onSubmit={handleEndorsementSubmit} className="endorsement-form">
                            <div className="form-group">
                                <label>Target Active Policy</label>
                                <select 
                                    required 
                                    value={endorsementForm.policyId} 
                                    onChange={(e) => setEndorsementForm({...endorsementForm, policyId: e.target.value})}
                                >
                                    <option value="">-- Select Active Policy --</option>
                                    {activePolicies.map(p => (
                                        <option key={p.policyId} value={p.policyId}>
                                            {p.policyNumber} (ID: {p.policyId})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Type of Change</label>
                                <select 
                                    value={endorsementForm.changeType} 
                                    onChange={(e) => setEndorsementForm({...endorsementForm, changeType: e.target.value})}
                                >
                                    <option value="ADD_COVERAGE">Add Coverage</option>
                                    <option value="REMOVE_COVERAGE">Remove Coverage</option>
                                    <option value="LIMIT_CHANGE">Limit Change</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Premium Adjustment ($)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    required 
                                    placeholder="Enter amount (e.g., 200.00)"
                                    value={endorsementForm.premiumDelta}
                                    onChange={(e) => setEndorsementForm({...endorsementForm, premiumDelta: e.target.value})}
                                />
                            </div>
                            <div className="modal-footer-actions">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Submit Change</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="table-controls">
                <div className="search-wrapper">
                    <FiSearch className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search by Quote ID..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-responsive">
                <table className="management-table">
                    <thead>
                        <tr>
                            <th>QUOTE ID</th>
                            <th>PREMIUM</th>
                            <th>STATUS</th>
                            <th>CREATED DATE</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quotes
                            .filter(q => q.quoteId.toString().includes(searchTerm))
                            .map((quote) => (
                            <tr key={quote.quoteId}>
                                <td className="quote-id-cell">Q-{quote.quoteId}</td>
                                <td className="premium-cell">
                                    {quote.premium ? `$${quote.premium.toLocaleString()}` : 'Pending'}
                                </td>
                                <td>
                                    <span className={`status-badge ${getStatusStyle(quote.status)}`}>
                                        {quote.status}
                                    </span>
                                </td>
                                <td>{new Date(quote.createdDate).toLocaleDateString()}</td>
                                <td className="actions-cell">
                                    {quote.status === 'DRAFT' && (
                                        <button onClick={() => handleRate(quote.quoteId)} className="btn-icon-table btn-rate" title="Calculate Premium">
                                            <FiPlay /> Rate
                                        </button>
                                    )}

                                    {quote.status === 'RATED' && (
                                        <button onClick={() => handleSubmit(quote.quoteId)} className="btn-icon-table btn-submit" title="Submit to Underwriting">
                                            <FiSend /> Submit
                                        </button>
                                    )}

                                    {quote.status === 'APPROVED' && (
                                        <button 
                                            onClick={() => handleIssuePolicy(quote.quoteId)} 
                                            className="btn-icon-table btn-issue" 
                                            style={{ color: '#10b981', fontWeight: 'bold' }} 
                                            title="Convert to Policy"
                                        >
                                            <FiShield /> Issue Policy
                                        </button>
                                    )}

                                    <button className="btn-icon-table"><FiEye /></button>
                                    <button className="btn-icon-table"><FiMoreVertical /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="management-footer">
                <div className="pagination-info">Showing {quotes.length} quotes</div>
                <div className="pagination-controls">
                    <button className="btn-icon-pagi"><FiChevronLeft /></button>
                    <button className="btn-icon-pagi active-pagi">1</button>
                    <button className="btn-icon-pagi"><FiChevronRight /></button>
                </div>
            </div>
        </div>
    );
};

export default QuoteManagement;