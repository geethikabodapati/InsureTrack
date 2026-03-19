import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FiSearch, FiFilter, FiEye, FiDownload, 
    FiMoreVertical, FiChevronLeft, FiChevronRight 
} from "react-icons/fi";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Changed this import
import '../styles/agentLayout.css'; 

const PolicyManagement = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const api = axios.create({
        baseURL: 'http://localhost:8082/api/agent/policies'
    });

    const fetchPolicies = async () => {
        try {
            // Using empty string to match @RequestMapping("/api/agent/policies") exactly
            const response = await api.get(''); 
            setPolicies(response.data || []);
        } catch (error) {
            console.error("Error fetching policies:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolicies();
    }, []);

    const getStatusClass = (status) => {
        switch (status) {
            case 'ACTIVE': return 'status-approved'; 
            case 'CANCELLED': return 'status-expired'; 
            default: return 'status-rated'; 
        }
    };

    /**
     * EXPORT SINGLE POLICY CERTIFICATE
     */
    const exportPolicyPDF = (policy) => {
        const doc = new jsPDF();
        
        doc.setFontSize(22);
        doc.setTextColor(37, 99, 235);
        doc.text("INSURE TRACK", 14, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Official Insurance Policy Certificate", 14, 28);
        doc.text(`Issued Date: ${new Date().toLocaleDateString()}`, 14, 33);

        // FIX: Use the imported autoTable function directly instead of doc.autoTable
        autoTable(doc, {
            startY: 40,
            head: [['Description', 'Policy Data']],
            body: [
                ['Policy Number', policy.policyNumber],
                ['Quote Reference', `Q-${policy.quoteId}`],
                ['Current Status', policy.status],
                ['Coverage Start', new Date(policy.effectiveDate).toLocaleDateString()],
                ['Coverage End', new Date(policy.expiryDate).toLocaleDateString()],
                ['Total Premium', `$${policy.premium?.toLocaleString()}`],
            ],
            headStyles: { fillColor: [37, 99, 235], fontSize: 12 },
            styles: { cellPadding: 5 },
            theme: 'grid'
        });

        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("This is a computer-generated document. No signature required.", 14, doc.lastAutoTable.finalY + 15);
        
        doc.save(`Certificate_${policy.policyNumber}.pdf`);
    };

    /**
     * EXPORT ALL POLICIES SUMMARY REPORT
     */
    const exportAllPoliciesPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Policy Management - Summary Report", 14, 15);
        
        const tableRows = policies.map(p => [
            p.policyNumber,
            `Q-${p.quoteId}`,
            new Date(p.effectiveDate).toLocaleDateString(),
            `$${p.premium?.toLocaleString()}`,
            p.status
        ]);

        // FIX: Use the imported autoTable function directly
        autoTable(doc, {
            startY: 25,
            head: [['Policy #', 'Quote ID', 'Effective Date', 'Premium', 'Status']],
            body: tableRows,
            headStyles: { fillColor: [51, 51, 51] }
        });

        doc.save("Policy_Summary_Report.pdf");
    };

    if (loading) return <div className="p-6 text-center">Loading issued policies...</div>;

    const filteredPolicies = policies.filter(p => 
        p.policyNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="management-container">
            <div className="management-header">
                <h2>Policy Management</h2>
                {/* <div className="header-actions">
                    <button className="btn-icon" onClick={exportAllPoliciesPDF}>
                        <FiDownload /> Export All
                    </button>
                    <button className="btn-icon"><FiFilter /> Filter</button>
                </div> */}
            </div>

            <div className="table-controls">
                <div className="search-wrapper">
                    <FiSearch className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search by Policy Number (e.g. POL-177...)" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-responsive">
                <table className="management-table">
                    <thead>
                        <tr>
                            <th>POLICY NUMBER</th>
                            <th>QUOTE ID</th>
                            <th>EFFECTIVE DATE</th>
                            <th>EXPIRY DATE</th>
                            <th>PREMIUM</th>
                            <th>STATUS</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPolicies.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                    No policies found matching your search.
                                </td>
                            </tr>
                        ) : (
                            filteredPolicies.map((policy) => (
                                <tr key={policy.policyId}>
                                    <td className="quote-id-cell" style={{ fontWeight: '600' }}>
                                        {policy.policyNumber}
                                    </td>
                                    <td>Q-{policy.quoteId}</td>
                                    <td>{new Date(policy.effectiveDate).toLocaleDateString()}</td>
                                    <td>{new Date(policy.expiryDate).toLocaleDateString()}</td>
                                    <td className="premium-cell">
                                        {policy.premium ? `$${policy.premium.toLocaleString()}` : '$0.00'}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(policy.status)}`}>
                                            {policy.status}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button className="btn-icon-table" title="View"><FiEye /></button>
                                        <button 
                                            className="btn-icon-table" 
                                            title="Download Certificate"
                                            onClick={() => exportPolicyPDF(policy)}
                                        >
                                            <FiDownload />
                                        </button>
                                        <button className="btn-icon-table"><FiMoreVertical /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="management-footer">
                <div className="pagination-info">Showing {filteredPolicies.length} records</div>
                <div className="pagination-controls">
                    <button className="btn-icon-pagi"><FiChevronLeft /></button>
                    <button className="btn-icon-pagi active-pagi">1</button>
                    <button className="btn-icon-pagi"><FiChevronRight /></button>
                </div>
            </div>
        </div>
    );
};

export default PolicyManagement;