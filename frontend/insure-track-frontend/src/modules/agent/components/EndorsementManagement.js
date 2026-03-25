import React, { useState, useEffect } from 'react';
import {
    FiSearch, FiCheckCircle, FiChevronLeft, FiChevronRight
} from "react-icons/fi";
import '../styles/agentModule.css';
import { fetchAgentEndorsements, approveEndorsement } from '../../../../src/core/services/api.js';

const EndorsementManagement = () => {
    const [endorsements, setEndorsements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // --- Pagination State ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await fetchAgentEndorsements();
            setEndorsements(response.data || []);
        } catch (error) {
            console.error("Error fetching endorsements:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm("Confirm approval for this policy change?")) return;
        try {
            await approveEndorsement(id);
            alert("Endorsement Approved Successfully!");
            loadData(); // Refresh the list
        } catch (error) {
            console.error("Approval failed:", error);
            alert("Failed to approve. Check console for details.");
        }
    };

    // --- Search & Pagination Logic ---
    const filteredData = endorsements.filter(e =>
        e.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.changeType?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const currentItems = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading) return <div className="p-6 text-center">Loading Endorsement Dashboard...</div>;

    return (
        <div className="management-container">
            <div className="management-header">
                <div>
                    <h2>Endorsement </h2>
{/*                     <p className="sub-text">Review pending policy modifications</p> */}
                </div>
            </div>

            <div className="table-controls">
                <div className="search-wrapper">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search customer or change type..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                </div>
            </div>

            <div className="table-responsive">
                <table className="management-table">
                    <thead>
                        <tr>
{/*                             <th>ID</th> */}
                            <th>CUSTOMER NAME</th>
                            <th>CHANGE TYPE</th>
                            <th>EFFECTIVE DATE</th>
                            <th>PREMIUM </th>
                            <th>STATUS</th>
                            <th style={{ textAlign: 'left' }}>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                                            {currentItems.length > 0 ? currentItems.map(end => (
                                                <tr key={end.endorsementId}>
{/*                                                     <td className="id-cell">E-{end.endorsementId}</td> */}
                                                    <td style={{ fontWeight: '600' }}>{end.customerName || "N/A"}</td>
                                                    <td>{end.changeType?.replace(/_/g, ' ')}</td>
                                                    <td>{new Date(end.effectiveDate).toLocaleDateString()}</td>
                                                    <td style={{
                                                        fontWeight: 'bold',
                                                        color: end.premiumDelta >= 0 ? '#10b981' : '#ef4444'
                                                    }}>
                                                        {end.premiumDelta >= 0 ? `${end.premiumDelta}` : `-${Math.abs(end.premiumDelta)}`}
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge status-${end.status.toLowerCase()}`}>
                                                            {end.status}
                                                        </span>
                                                    </td>
                                                    {/* --- FIXED ALIGNMENT CELL --- */}
                                                    <td className="actions-cell">
                                                        <div
                                                            className="actions-wrapper"
                                                            style={{
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                minHeight: '32px' // Ensures consistent height regardless of content
                                                            }}
                                                        >
                                                            {end.status === 'DRAFT' ? (
                                                                <button
                                                                    className="btn-icon-table btn-approve"
                                                                    title="Approve"
                                                                    onClick={() => handleApprove(end.endorsementId)}
                                                                    style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}
                                                                >
                                                                    <FiCheckCircle size={22} color="#10b981" />
                                                                </button>
                                                            ) : (
                                                                <span style={{
                                                                    fontSize: '12px',
                                                                    color: '#999',
                                                                    fontWeight: '600',
                                                                    lineHeight: '22px' // Matches the icon size for perfect alignment
                                                                }}>
                                                                    Complete
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="7" className="text-center">No pending endorsements.</td></tr>
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

export default EndorsementManagement;