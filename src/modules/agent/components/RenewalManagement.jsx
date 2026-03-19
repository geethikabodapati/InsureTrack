// src/modules/agent/components/RenewalManagement.jsx
import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiEye, FiMail, FiMoreVertical } from "react-icons/fi";
import '../styles/agentModule.css';

const RenewalManagement = () => {
    const [renewals, setRenewals] = useState([]);

    useEffect(() => {
        // Data structure based on your Renewal Entity and Figma screenshot
        const mockRenewals = [
            { renewalId: "REN-2026-001", policyId: "POL-2025-1234", customer: "William Davis", product: "Auto Insurance", expiryDate: "Mar 25, 2026", currentPremium: 1450, proposedPremium: 1520, status: "Offered" },
            { renewalId: "REN-2026-002", policyId: "POL-2025-2456", customer: "Elizabeth Taylor", product: "Home Insurance", expiryDate: "Apr 5, 2026", currentPremium: 3200, proposedPremium: 3450, status: "Accepted" },
            { renewalId: "REN-2026-003", policyId: "POL-2025-3789", customer: "Richard Moore", product: "Life Insurance", expiryDate: "Apr 12, 2026", currentPremium: 2000, proposedPremium: 2100, status: "Offered" },
            { renewalId: "REN-2026-004", policyId: "POL-2025-4012", customer: "Margaret Wilson", product: "Auto Insurance", expiryDate: "Apr 18, 2026", currentPremium: 1280, proposedPremium: 1350, status: "Declined" },
            { renewalId: "REN-2026-005", policyId: "POL-2025-4567", customer: "Joseph Martinez", product: "Business Insurance", expiryDate: "Apr 22, 2026", currentPremium: 6500, proposedPremium: 6800, status: "Offered" }
        ];
        setRenewals(mockRenewals);
    }, []);

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'accepted': return 'status-approved'; // Green
            case 'declined': return 'status-expired';  // Red
            case 'offered': return 'status-rated';     // Purple/Blue
            default: return 'status-draft';
        }
    };

    return (
        <div className="management-container">
            <div className="management-header">
                <h2>Renewals</h2>
                <p className="sub-text">Monitor and process upcoming policy renewals and premium offers</p>
            </div>

            <div className="table-controls">
                <div className="search-wrapper">
                    <FiSearch className="search-icon" />
                    <input type="text" placeholder="Search renewals..." />
                </div>
                <button className="btn-filter"><FiFilter /> Filter</button>
            </div>

            <div className="table-responsive">
                <table className="management-table">
                    <thead>
                        <tr>
                            <th>RENEWAL ID</th>
                            <th>POLICY NUMBER</th>
                            <th>CUSTOMER</th>
                            <th>PRODUCT</th>
                            <th>EXPIRY DATE</th>
                            <th>CURRENT PREMIUM</th>
                            <th>PROPOSED PREMIUM</th>
                            <th>STATUS</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renewals.map((ren) => (
                            <tr key={ren.renewalId}>
                                <td className="quote-id-cell">{ren.renewalId}</td>
                                <td>{ren.policyId}</td>
                                <td>{ren.customer}</td>
                                <td>{ren.product}</td>
                                <td>{ren.expiryDate}</td>
                                <td>${ren.currentPremium.toLocaleString()}</td>
                                <td style={{ fontWeight: '700', color: '#101828' }}>
                                    ${ren.proposedPremium.toLocaleString()}
                                </td>
                                <td>
                                    <span className={`status-badge ${getStatusClass(ren.status)}`}>
                                        {ren.status}
                                    </span>
                                </td>
                                <td className="actions-cell">
                                    <button className="btn-icon-table" title="View Details"><FiEye /></button>
                                    <button className="btn-icon-table" title="Send Offer"><FiMail /></button>
                                    <button className="btn-icon-table"><FiMoreVertical /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="management-footer">
                <div className="pagination-info">Showing 1 to 5 of 87 renewals</div>
            </div>
        </div>
    );
};

export default RenewalManagement;