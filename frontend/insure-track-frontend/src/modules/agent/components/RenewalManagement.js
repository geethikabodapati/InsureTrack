import React, { useState, useEffect } from 'react';
import { FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { fetchAgentRenewals, updateRenewalStatusApi } from '../../../../src/core/services/api.js';
import '../styles/agentModule.css';

const RenewalManagement = () => {
    const [renewals, setRenewals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        loadRenewals();
    }, []);

    const loadRenewals = async () => {
        try {
            setLoading(true);
            const response = await fetchAgentRenewals();
            setRenewals(response.data || []);
        } catch (error) {
            console.error("Error fetching renewals:", error);
        } finally {
            setLoading(false);
        }
    };

    // MODIFIED: Added 'async' and API call logic
    const handleStatusClick = async (renewalId, currentStatus) => {
        if (currentStatus?.toLowerCase() !== 'offered') return;

        const action = window.confirm("Would you like to ACCEPT this renewal? \n\n(Click 'OK' to Accept, 'Cancel' to Decline)");

        // Determine the new status based on the user's click
        let newStatus = 'ACCEPTED';

        if (!action) {
            const confirmDecline = window.confirm("Are you sure you want to DECLINE this renewal?");
            if (confirmDecline) {
                newStatus = 'DECLINED';
            } else {
                return; // User cancelled both options, do nothing
            }
        }

        try {
            // 1. Call the actual Backend API
            await updateRenewalStatusApi(renewalId, newStatus);

            // 2. If API is successful, update local state
            updateLocalState(renewalId, newStatus);

            alert(`Renewal ${newStatus.toLowerCase()} successfully.`);
        } catch (error) {
            console.error("Error updating renewal status:", error);
            alert("Failed to update status on server. Please try again.");
        }
    };

    // Helper to update state without a full reload
    const updateLocalState = (id, newStatus) => {
        setRenewals(prev =>
            prev.map(item => item.renewalId === id ? { ...item, status: newStatus } : item)
        );
    };

    const getStatusClass = (status) => {
        if (!status) return 'status-draft';
        switch (status.toLowerCase()) {
            case 'accepted': return 'status-approved';
            case 'declined': return 'status-expired';
            case 'offered': return 'status-rated';
            default: return 'status-draft';
        }
    };

    // Filter logic
    const filteredRenewals = renewals.filter(r =>
        r.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.policyNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredRenewals.length / itemsPerPage);
    const currentItems = filteredRenewals.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading) return <div className="p-6 text-center">Loading Renewal Dashboard...</div>;

    return (
        <div className="management-container">
            <div className="management-header">
                <h2>Renewals</h2>
            </div>

            <div className="table-controls">
                <div className="search-wrapper">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by customer or policy..."
                        value={searchTerm}
                        onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                    />
                </div>
            </div>

            <div className="table-responsive">
                <table className="management-table">
                    <thead>
                        <tr>
                            <th>POLICY NUMBER</th>
                            <th>CUSTOMER</th>
                            <th>PRODUCT</th>
                            <th>OFFER DATE</th>
                            <th>CURRENT PREMIUM</th>
                            <th>PROPOSED PREMIUM</th>
                            <th>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((ren) => (
                                <tr key={ren.renewalId}>
                                    <td>{ren.policyNumber}</td>
                                    <td style={{ fontWeight: '600' }}>{ren.customerName}</td>
                                    <td>{ren.productName}</td>
                                    <td>{new Date(ren.offerDate).toLocaleDateString()}</td>
                                    <td>{ren.currentPremium?.toLocaleString()}</td>
                                    <td style={{ fontWeight: '700', color: '#101828' }}>
                                        {ren.proposedPremium?.toLocaleString()}
                                    </td>
                                    <td>
                                        <span
                                            className={`status-badge ${getStatusClass(ren.status)}`}
                                            onClick={() => handleStatusClick(ren.renewalId, ren.status)}
                                            style={{
                                                cursor: ren.status?.toLowerCase() === 'offered' ? 'pointer' : 'default',
                                                userSelect: 'none'
                                            }}
                                            title={ren.status?.toLowerCase() === 'offered' ? 'Click to manage offer' : ''}
                                        >
                                            {ren.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>No records found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="management-footer">
                <div className="pagination-info">
                    Showing {currentItems.length} of {filteredRenewals.length} renewals
                </div>
                <div className="pagination-controls">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="btn-icon-pagi"
                    >
                        <FiChevronLeft />
                    </button>
                    <button className="btn-icon-pagi active-pagi">{currentPage}</button>
                    <button
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="btn-icon-pagi"
                    >
                        <FiChevronRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RenewalManagement;