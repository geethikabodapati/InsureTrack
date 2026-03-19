// src/modules/agent/components/CancellationManagement.jsx
import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiEye, FiMoreVertical } from "react-icons/fi";
import '../styles/agentModule.css';

const CancellationManagement = () => {
    const [cancellations, setCancellations] = useState([]);

    useEffect(() => {
        // Data structure based on your CancellationResponseDTO and Figma design
        const mockCancellations = [
            { cancellationId: 1, policyId: 4102, customer: "Thomas Brown", product: "Auto Insurance", reason: "Customer Request", effectiveDate: "2026-03-20", refundAmount: 450, status: "Approved" },
            { cancellationId: 2, policyId: 3456, customer: "Maria Garcia", product: "Business Insurance", reason: "Non-Payment", effectiveDate: "2026-03-15", refundAmount: 0, status: "Processed" },
            { cancellationId: 3, policyId: 5678, customer: "Patricia Lee", product: "Home Insurance", reason: "Found Better Rate", effectiveDate: "2026-03-25", refundAmount: 780, status: "Requested" },
            { cancellationId: 4, policyId: 6789, customer: "Charles Wright", product: "Auto Insurance", reason: "Sold Vehicle", effectiveDate: "2026-04-01", refundAmount: 320, status: "Approved" },
            { cancellationId: 5, policyId: 7890, customer: "Nancy Harris", product: "Life Insurance", reason: "Customer Request", effectiveDate: "2026-04-10", refundAmount: 210, status: "Requested" }
        ];
        setCancellations(mockCancellations);
    }, []);

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'approved': return 'status-approved'; // Green
            case 'processed': return 'status-rated';    // Purple/Blue
            case 'requested': return 'status-draft';    // Yellow/Amber
            default: return '';
        }
    };

    return (
        <div className="management-container">
            <div className="management-header">
                <h2>Cancellations</h2>
                <p className="sub-text">Process and track policy termination requests and refunds</p>
            </div>

            <div className="table-controls">
                <div className="search-wrapper">
                    <FiSearch className="search-icon" />
                    <input type="text" placeholder="Search cancellations..." />
                </div>
                <button className="btn-filter"><FiFilter /> Filter</button>
            </div>

            <div className="table-responsive">
                <table className="management-table">
                    <thead>
                        <tr>
                            <th>CANCELLATION ID</th>
                            <th>POLICY NUMBER</th>
                            <th>CUSTOMER</th>
                            <th>PRODUCT</th>
                            <th>CANCELLATION REASON</th>
                            <th>EFFECTIVE DATE</th>
                            <th>REFUND AMOUNT</th>
                            <th>STATUS</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cancellations.map((can) => (
                            <tr key={can.cancellationId}>
                                <td className="quote-id-cell">CAN-2026-00{can.cancellationId}</td>
                                <td>POL-2025-{can.policyId}</td>
                                <td>{can.customer}</td>
                                <td>{can.product}</td>
                                <td>{can.reason}</td>
                                <td>{can.effectiveDate}</td>
                                <td>${can.refundAmount}</td>
                                <td>
                                    <span className={`status-badge ${getStatusClass(can.status)}`}>
                                        {can.status}
                                    </span>
                                </td>
                                <td className="actions-cell">
                                    <button className="btn-icon-table" title="View Details"><FiEye /></button>
                                    <button className="btn-icon-table"><FiMoreVertical /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="management-footer">
                <p>Showing 1 to {cancellations.length} of 15 cancellations</p>
            </div>
        </div>
    );
};

export default CancellationManagement;