import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FiSearch, FiFilter, FiEye, FiCheckCircle, 
    FiPlus, FiX, FiChevronLeft, FiChevronRight 
} from "react-icons/fi";
import '../styles/agentModule.css';

const EndorsementManagement = () => {
    const [endorsements, setEndorsements] = useState([]);
    const [activePolicies, setActivePolicies] = useState([]); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Form State for New Endorsement
    const [formData, setFormData] = useState({
        policyId: '',
        changeType: 'ADD_COVERAGE',
        premiumDelta: ''
    });

    const API_BASE = 'http://localhost:8082/api/customer/endorsements';
    const POLICY_API = 'http://localhost:8082/api/agent/policies';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [endRes, polRes] = await Promise.all([
                axios.get(API_BASE),
                axios.get(POLICY_API)
            ]);
            setEndorsements(endRes.data);
            // Only allow endorsements for ACTIVE policies
            setActivePolicies(polRes.data.filter(p => p.status === 'ACTIVE'));
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(API_BASE, {
                ...formData,
                premiumDelta: parseFloat(formData.premiumDelta)
            });
            setIsModalOpen(false);
            setFormData({ policyId: '', changeType: 'ADD_COVERAGE', premiumDelta: '' });
            fetchData(); 
            alert("Endorsement Created Successfully!");
        } catch (error) {
            alert("Error creating endorsement. Ensure Policy is still active.");
        }
    };

    // Handler for the Approval checkmark
    const handleApprove = async (id) => {
        try {
            await axios.put(`${API_BASE}/${id}/approve`);
            fetchData();
            alert("Endorsement Approved & Premium Updated!");
        } catch (error) {
            console.error("Approval failed:", error);
        }
    };

    if (loading) return <div className="p-6 text-center">Loading Endorsement Dashboard...</div>;

    return (
        <div className="management-container">
            {/* HEADER SECTION */}
            <div className="management-header">
                <div>
                    <h2>Endorsements</h2>
                    <p className="sub-text">Manage policy changes and endorsements</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <FiPlus /> New Endorsement
                </button>
            </div>

            {/* NEW ENDORSEMENT MODAL */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Create New Endorsement</h3>
                            <button className="btn-close" onClick={() => setIsModalOpen(false)}><FiX /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="endorsement-form">
                            <div className="form-group">
                                <label>Select Active Policy</label>
                                <select 
                                    required 
                                    value={formData.policyId} 
                                    onChange={(e) => setFormData({...formData, policyId: e.target.value})}
                                >
                                    <option value="">-- Choose Policy --</option>
                                    {activePolicies.map(p => (
                                        <option key={p.policyId} value={p.policyId}>
                                            {p.policyNumber} (ID: {p.policyId})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Change Type</label>
                                <select 
                                    value={formData.changeType} 
                                    onChange={(e) => setFormData({...formData, changeType: e.target.value})}
                                >
                                    <option value="ADD_COVERAGE">Add Coverage</option>
                                    <option value="REMOVE_COVERAGE">Remove Coverage</option>
                                    <option value="LIMIT_CHANGE">Limit Change</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Premium Change ($)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    required 
                                    placeholder="Enter delta (e.g. 200.00)"
                                    value={formData.premiumDelta}
                                    onChange={(e) => setFormData({...formData, premiumDelta: e.target.value})}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Submit Endorsement</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* SEARCH & FILTERS */}
            <div className="table-controls">
                <div className="search-wrapper">
                    <FiSearch className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search by Policy ID or Type..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {/* <button className="btn-icon btn-filter"><FiFilter /> Filter</button> */}
            </div>

            {/* ENDORSEMENT TABLE */}
            <div className="table-responsive">
                <table className="management-table">
                    <thead>
                        <tr>
                            <th>ENDORSEMENT ID</th>
                            <th>POLICY ID</th>
                            <th>CHANGE TYPE</th>
                            <th>EFFECTIVE DATE</th>
                            <th>PREMIUM CHANGE</th>
                            <th>STATUS</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {endorsements
                            .filter(e => e.policyId.toString().includes(searchTerm) || e.changeType.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map(end => (
                            <tr key={end.endorsementId}>
                                <td className="id-cell">END-{end.endorsementId}</td>
                                <td>{end.policyId}</td>
                                <td>{end.changeType.replace('_', ' ')}</td>
                                <td>{end.effectiveDate || new Date().toLocaleDateString()}</td>
                                <td style={{ 
                                    fontWeight: 'bold', 
                                    color: end.premiumDelta >= 0 ? '#10b981' : '#ef4444' 
                                }}>
                                    {end.premiumDelta >= 0 ? `+$${end.premiumDelta}` : `-$${Math.abs(end.premiumDelta)}`}
                                </td>
                                <td>
                                    <span className={`status-badge status-${end.status.toLowerCase()}`}>
                                        {end.status}
                                    </span>
                                </td>
                                <td className="actions-cell">
                                    <button className="btn-icon-table" title="View Details"><FiEye /></button>
                                    {end.status === 'PENDING' && (
                                        <button 
                                            className="btn-icon-table btn-approve" 
                                            title="Approve Change"
                                            onClick={() => handleApprove(end.endorsementId)}
                                        >
                                            <FiCheckCircle />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* FOOTER */}
            <div className="management-footer">
                <div className="pagination-info">Showing {endorsements.length} endorsements</div>
                <div className="pagination-controls">
                    <button className="btn-icon-pagi"><FiChevronLeft /></button>
                    <button className="btn-icon-pagi active-pagi">1</button>
                    <button className="btn-icon-pagi"><FiChevronRight /></button>
                </div>
            </div>
        </div>
    );
};

export default EndorsementManagement;