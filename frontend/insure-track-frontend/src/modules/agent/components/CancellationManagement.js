import React, { useState, useEffect } from 'react';
import {
    FiSearch, FiCheckCircle, FiChevronLeft, FiChevronRight
} from "react-icons/fi";
import { fetchAgentCancellations, approveCancellation } from '../../../../src/core/services/api.js';
import '../styles/agentModule.css';

const CancellationManagement = () => {
    const [cancellations, setCancellations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        loadCancellations();
    }, []);

    const loadCancellations = async () => {
        try {
            setLoading(true);
            const response = await fetchAgentCancellations();
            setCancellations(response.data || []);
        } catch (error) {
            console.error("Error loading cancellations:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm("Are you sure you want to approve this cancellation?")) return;
        try {
            await approveCancellation(id);
            alert("Cancellation Approved !");
            loadCancellations(); // Refresh the list
        } catch (error) {
            console.error("Approval failed:", error);
            alert("Failed to approve cancellation.");
        }
    };

    const getStatusClass = (status) => {
        if (!status) return 'status-draft';
        switch (status.toUpperCase()) {
            case 'APPROVED': return 'status-approved'; // Green
            case 'PROCESSED': return 'status-rated';    // Blue/Purple
            case 'REQUESTED': return 'status-draft';    // Yellow
            default: return 'status-draft';
        }
    };

    // --- Search & Pagination Logic ---
    const filteredData = cancellations.filter(can =>
        can.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        can.policyNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        can.reason?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const currentItems = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading) return <div className="p-6 text-center">Loading Cancellation Dashboard...</div>;

    return (
        <div className="management-container">
            <div className="management-header">
                <div>
                    <h2>Cancellations</h2>
                </div>
            </div>

            <div className="table-controls">
                <div className="search-wrapper">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by Customer, Policy or Reason..."
                        value={searchTerm}
                        onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                    />
                </div>
            </div>

            <div className="table-responsive">
                <table className="management-table">
                    <thead>
                        <tr>
                            {/* Removed ID Column Header */}
                            <th>POLICY NUMBER</th>
                            <th>CUSTOMER</th>
                            <th>REASON</th>
                            <th>EFFECTIVE DATE</th>
                            {/* <th>REFUND</th> */}
                            {/* <th>STATUS</th> */}
                            <th style={{ textAlign: 'left' }}>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? currentItems.map((can) => (
                            <tr key={can.cancellationId}>
                                {/* Removed ID Cell */}
                                <td>{can.policyNumber}</td>
                                <td style={{ fontWeight: '600' }}>{can.customerName}</td>
                                <td className="reason-cell" title={can.reason}>
                                    {can.reason?.length > 20 ? `${can.reason.substring(0, 20)}...` : can.reason}
                                </td>
                                <td>{can.effectiveDate ? new Date(can.effectiveDate).toLocaleDateString() : 'N/A'}</td>

                                {/* Commented Refund Cell */}
                                {/* <td style={{ fontWeight: 'bold', color: '#101828' }}>
                                    ${can.refundAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td> */}

                                {/* Commented Status Cell */}
                                {/* <td>
                                    <span className={`status-badge ${getStatusClass(can.status)}`}>
                                        {can.status}
                                    </span>
                                </td> */}

                                <td className="actions-cell">
                                    <div className="actions-wrapper">
                                        {can.status === 'REQUESTED' ? (
                                            <button
                                                className="btn-icon-table btn-approve"
                                                title="Approve Cancellation"
                                                onClick={() => handleApprove(can.cancellationId)}
                                            >
                                                <FiCheckCircle size={22} color="#10b981" />
                                            </button>
                                        ) : (
                                            <span style={{ fontSize: '12px', color: '#999' }}>Completed</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5" style={{textAlign: 'center', padding: '30px'}}>No cancellation requests found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="management-footer">
                <div className="pagination-info">
                    Showing {currentItems.length} of {filteredData.length} entries
                </div>
                <div className="pagination-controls">
                    <button
                        className="btn-icon-pagi"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                        <FiChevronLeft />
                    </button>
                    <button className="btn-icon-pagi active-pagi">{currentPage}</button>
                    <button
                        className="btn-icon-pagi"
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                        <FiChevronRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancellationManagement;