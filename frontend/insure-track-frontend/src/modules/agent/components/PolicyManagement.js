import React, { useState, useEffect } from 'react';
import {
    FiSearch, FiDownload,
    FiChevronLeft, FiChevronRight
} from "react-icons/fi";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fetchActivePolicies } from '../../../../src/core/services/api.js';

const PolicyManagement = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const loadPolicies = async () => {
        setLoading(true);
        try {
            // This now uses the instance with the JWT interceptor
            const response = await fetchActivePolicies();
            setPolicies(response.data || []);
        } catch (error) {
            console.error("Error fetching policies:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPolicies();
    }, []);

    const getStatusClass = (status) => {
        switch (status) {
            case 'ACTIVE': return 'status-approved';
            case 'CANCELLED': return 'status-expired';
            default: return 'status-rated';
        }
    };

    // Pagination & Search Logic
    const filteredPolicies = policies.filter(p =>
        p.policyNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredPolicies.length / itemsPerPage);
    const currentItems = filteredPolicies.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const exportPolicyPDF = (policy) => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text("Policy Certificate", 14, 20);
        autoTable(doc, {
            startY: 30,
            head: [['Field', 'Details']],
            body: [
                ['Policy Number', policy.policyNumber],
                ['Customer', policy.customerName],
                ['Premium', `${policy.premium}`],
                ['Status', policy.status]
            ],
        });
        doc.save(`${policy.policyNumber}.pdf`);
    };

    if (loading) return <div className="p-6 text-center">Loading policies...</div>;

    return (
        <div className="management-container">
            <div className="management-header">
                <h2>Policy Management</h2>
            </div>

            <div className="table-controls">
                <div className="search-wrapper">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search policy or customer..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                </div>
            </div>

            <div className="table-responsive">
                <table className="management-table">
                    <thead>
                        <tr>
                            <th>POLICY NUMBER</th>
                            <th>CUSTOMER NAME</th>
                            <th>EFFECTIVE DATE</th>
                            <th>EXPIRY DATE</th>
                            <th>PREMIUM</th>
                            <th>STATUS</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? currentItems.map((policy) => (
                            <tr key={policy.policyId}>
                                <td>{policy.policyNumber}</td>
                                <td>{policy.customerName || "N/A"}</td>
                                <td>{policy.effectiveDate}</td>
                                <td>{policy.expiryDate}</td>
                                <td>{policy.premium?.toLocaleString()}</td>
                                <td>
                                    <span className={`status-badge ${getStatusClass(policy.status)}`}>
                                        {policy.status}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn-icon-table" onClick={() => exportPolicyPDF(policy)}>
                                        <FiDownload />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="7" className="text-center">No policies found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="management-footer">
                <div className="pagination-info">Page {currentPage} of {totalPages || 1}</div>
                <div className="pagination-controls">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="btn-icon-pagi"><FiChevronLeft /></button>
                    <button className="btn-icon-pagi active-pagi">{currentPage}</button>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="btn-icon-pagi"><FiChevronRight /></button>
                </div>
            </div>
        </div>
    );
};

export default PolicyManagement;