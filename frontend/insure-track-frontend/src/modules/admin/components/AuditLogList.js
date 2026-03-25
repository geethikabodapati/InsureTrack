import React, { useEffect, useState } from 'react';
import { getAuditLogs } from '../../../core/services/api';
import {
    Search,
    Download,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    SearchX,
    FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx'; // Import for Excel Export
import '../styles/AdminTables.css';
 
const AuditLogList = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
   
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
 
    useEffect(() => {
        fetchLogs();
    }, []);
 
    const fetchLogs = () => {
        setLoading(true);
        getAuditLogs()
            .then(response => {
                const data = response.data || response;
                setLogs(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching logs:", err);
                setLoading(false);
            });
    };
 
    /**
     * EXPORT TO EXCEL LOGIC
     * Uses the 'xlsx' library to convert JSON to a downloadable .xlsx file
     */
    const handleExportExcel = () => {
        if (filteredLogs.length === 0) return;
 
        // 1. Prepare data with clean headers for the spreadsheet
        const excelData = filteredLogs.map(log => ({
            'User': log.user?.name || log.user?.email || log.user_id || 'System',
            'Action': log.action?.toUpperCase() || 'N/A',
            'Timestamp': log.timestamp ? new Date(log.timestamp).toLocaleString('en-GB') : 'N/A',
            'Details': log.metadata || 'No additional details'
        }));
 
        // 2. Create worksheet and workbook
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Audit Logs");
 
        // 3. Auto-adjust column widths (Optional but nice)
        const maxWidth = 50;
        worksheet['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: maxWidth }];
 
        // 4. Download file
        const fileName = `Audit_Logs_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };
 
    const getActionBadgeClass = (action) => {
        const a = action?.toUpperCase() || '';
        if (a.includes('REGISTER') || a.includes('CREATE')) return 'badge-create';
        if (a.includes('LOGIN') || a.includes('UPDATE')) return 'badge-update';
        if (a.includes('DELETE')) return 'badge-delete';
        return 'badge-default';
    };
 
    // Filter logic
    const filteredLogs = logs.filter(log => {
        const userName = log.user?.name || '';
        const userEmail = log.user?.email || '';
        const action = log.action || '';
        const metadata = log.metadata || '';
        const search = searchTerm.toLowerCase();
 
        return (
            userName.toLowerCase().includes(search) ||
            userEmail.toLowerCase().includes(search) ||
            action.toLowerCase().includes(search) ||
            metadata.toLowerCase().includes(search)
        );
    });
 
    // Pagination Calculation
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredLogs.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredLogs.length / rowsPerPage);
 
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };
 
    const getPaginationGroup = () => {
        let start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
        if (totalPages <= 5) start = 1;
        const group = [];
        for (let i = 0; i < Math.min(5, totalPages); i++) {
            group.push(start + i);
        }
        return group;
    };
 
    return (
        <div className="table-container">
            <div className="table-header-section">
                <div className="table-title">
                    <h1 style={{ color: 'var(--text-main)' }}>System Audit Logs</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Monitor administrative actions and security events</p>
                </div>
                <div className="header-actions" style={{ display: 'flex', gap: '10px' }}>
                    {/* NEW EXCEL BUTTON */}
                    <button
                        className="export-btn excel-theme"
                        onClick={handleExportExcel}
                        style={{ ...btnBaseStyle, backgroundColor: '#59a8dcff', color: 'white' }}
                        disabled={filteredLogs.length === 0}
                    >
                        <FileSpreadsheet size={18} /> Export Excel
                    </button>
 
                    {/* <button className="export-btn" onClick={() => window.print()} style={btnBaseStyle}>
                        <Download size={18} /> Print PDF
                    </button> */}
                </div>
            </div>
 
            <div className="table-card">
                <div className="table-controls-top" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px'
                }}>
                    <div className="search-wrapper" style={{ width: '350px', position: 'relative' }}>
                        <Search className="search-icon" size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Search by user, action, or details..."
                            className="search-input-field"
                            style={{ paddingLeft: '40px', width: '100%', height: '42px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
 
                    <div className="page-length" style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>
                        Show
                        <select
                            value={rowsPerPage}
                            onChange={(e) => {setRowsPerPage(Number(e.target.value)); setCurrentPage(1);}}
                            style={{ margin: '0 10px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                        >
                            <option value={5}>5 entries</option>
                            <option value={10}>10 entries</option>
                            <option value={25}>25 entries</option>
                            <option value={50}>50 entries</option>
                        </select>
                    </div>
                </div>
 
                {loading ? (
                    <div style={{padding: '100px', textAlign: 'center', color: '#64748b'}}>
                        <div className="loader-spinner" style={{ marginBottom: '10px' }}>⌛</div>
                        Loading activity logs...
                    </div>
                ) : (
                    <>
                        {logs.length === 0 ? (
                            <div style={{ padding: '100px 20px', textAlign: 'center', color: '#64748b' }}>
                                <ClipboardList size={50} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
                                <h3 style={{ color: '#1e293b' }}>No activity logs found</h3>
                                <p>System logs will appear here as soon as users perform actions.</p>
                            </div>
                        ) : filteredLogs.length === 0 ? (
                            <div style={{ padding: '100px 20px', textAlign: 'center', color: '#64748b' }}>
                                <SearchX size={50} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
                                <h3 style={{ color: '#1e293b' }}>No matching results</h3>
                                <p>We couldn't find anything for "<strong>{searchTerm}</strong>"</p>
                                <button onClick={() => setSearchTerm("")} style={{ marginTop: '20px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Clear Filters</button>
                            </div>
                        ) : (
                            <>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '20%' }}>User Name</th>
                                            <th style={{ width: '15%' }}>Action</th>
                                            <th style={{ width: '20%' }}>Timestamp</th>
                                            <th style={{ width: '45%' }}>Description </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentRows.map((log, index) => (
                                            <tr key={log.auditId || `log-${index}`}>
                                                <td style={{ fontWeight: '600', color: '#1e293b' }}>
                                                    {log.user?.name || log.user?.email || log.user_id || 'System'}
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${getActionBadgeClass(log.action)}`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td style={{ color: '#64748b', fontSize: '13px' }}>
                                                    {log.timestamp ? new Date(log.timestamp).toLocaleString('en-GB', {
                                                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    }) : 'N/A'}
                                                </td>
                                                <td style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                                                    {log.metadata || 'No additional details'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
 
                                <div className="table-footer" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '20px',
                                    borderTop: '1px solid #f1f5f9'
                                }}>
                                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                                        Showing <strong>{indexOfFirstRow + 1}</strong> to <strong>{Math.min(indexOfLastRow, filteredLogs.length)}</strong> of <strong>{filteredLogs.length}</strong> records
                                    </div>
 
                                    <div className="pagination-controls" style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            className="page-nav-btn"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(prev => prev - 1)}
                                            style={navBtnStyle}
                                        >
                                            <ChevronLeft size={16} /> Prev
                                        </button>
 
                                        {getPaginationGroup().map((item) => (
                                            <button
                                                key={item}
                                                onClick={() => setCurrentPage(item)}
                                                style={{
                                                    ...pageNumStyle,
                                                    backgroundColor: currentPage === item ? '#3b82f6' : 'transparent',
                                                    color: currentPage === item ? '#fff' : '#64748b',
                                                    border: '1px solid',
                                                    borderColor: currentPage === item ? '#3b82f6' : '#e2e8f0',
                                                    fontWeight: currentPage === item ? '700' : '400'
                                                }}
                                            >
                                                {item}
                                            </button>
                                        ))}
 
                                        <button
                                            className="page-nav-btn"
                                            disabled={currentPage === totalPages || totalPages === 0}
                                            onClick={() => setCurrentPage(prev => prev + 1)}
                                            style={navBtnStyle}
                                        >
                                            Next <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
 
// Inline styles for consistency
const btnBaseStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: '0.3s'
};
 
const navBtnStyle = {
    display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', cursor: 'pointer', color: '#475569', transition: '0.2s'
};
 
const pageNumStyle = {
    minWidth: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px', transition: '0.2s'
};
 
export default AuditLogList;