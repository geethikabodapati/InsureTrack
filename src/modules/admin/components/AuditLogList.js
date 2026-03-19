import React, { useEffect, useState } from 'react';
import { getAuditLogs } from '../../../core/services/api';
import { Search, Download, ChevronLeft, ChevronRight, ClipboardList, SearchX } from 'lucide-react';
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

    const getActionBadgeClass = (action) => {
        const a = action?.toUpperCase() || '';
        if (a.includes('REGISTER') || a.includes('CREATE')) return 'badge-create';
        if (a.includes('LOGIN') || a.includes('UPDATE')) return 'badge-update';
        if (a.includes('DELETE')) return 'badge-delete';
        return 'badge-default';
    };

    // 1. Filter logic
    const filteredLogs = logs.filter(log => 
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.metadata?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Pagination Calculation
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
                    <h1>Audit Logs</h1>
                    <p>Track all system activities and security events</p>
                </div>
                <div className="header-actions">
                    <button className="export-btn" onClick={() => window.print()}>
                        <Download size={18} /> Export
                    </button>
                </div>
            </div>

            <div className="table-card">
                {/* --- HEADER CONTROLS --- */}
                <div className="table-controls-top" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '15px' 
                }}>
                    <div className="search-wrapper" style={{ width: '300px', position: 'relative' }}>
                        <Search className="search-icon" size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input 
                            type="text" 
                            placeholder="Search logs..." 
                            className="search-input-field"
                            style={{ paddingLeft: '35px', width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>

                    <div className="page-length" style={{ color: '#64748b', fontSize: '14px' }}>
                        Show 
                        <select 
                            value={rowsPerPage} 
                            onChange={(e) => {setRowsPerPage(Number(e.target.value)); setCurrentPage(1);}}
                            style={{ margin: '0 8px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#fff' }}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select> 
                        entries
                    </div>
                </div>

                {loading ? (
                    <div className="loading-text" style={{padding: '60px', textAlign: 'center', color: '#64748b'}}>
                        Loading audit activities...
                    </div>
                ) : (
                    <>
                        {/* CASE 1: No logs in database at all */}
                        {logs.length === 0 ? (
                            <div style={{ padding: '80px 20px', textAlign: 'center', color: '#64748b' }}>
                                <ClipboardList size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                                <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>No activity recorded</h3>
                                <p>System audit logs will appear here once activity occurs.</p>
                            </div>
                        ) : 
                        /* CASE 2: Search filter returned nothing */
                        filteredLogs.length === 0 ? (
                            <div style={{ padding: '80px 20px', textAlign: 'center', color: '#64748b' }}>
                                <SearchX size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                                <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>No matches found</h3>
                                <p>We couldn't find any logs matching "<strong>{searchTerm}</strong>"</p>
                                <button 
                                    onClick={() => setSearchTerm("")}
                                    style={{ marginTop: '16px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                                >
                                    Reset Search
                                </button>
                            </div>
                        ) : (
                            /* CASE 3: Table Display */
                            <>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Log ID</th>
                                            <th>Timestamp</th>
                                            <th>User ID</th>
                                            <th>Action</th>
                                            <th>Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentRows.map((log) => (
                                            <tr key={log.auditId || log.audit_id}>
                                                <td style={{ fontWeight: '600' }}>
                                                    LOG-{String(log.auditId || log.audit_id || '').padStart(3, '0')}
                                                </td>
                                                <td style={{ color: '#64748b' }}>
                                                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                                                </td>
                                                <td>{log.user?.userId || log.user_id || 'System'}</td>
                                                <td>
                                                    <span className={`status-badge ${getActionBadgeClass(log.action)}`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: '13px', color: '#475569' }}>
                                                    {log.metadata}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* --- FOOTER --- */}
                                <div className="table-footer" style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    padding: '15px',
                                    borderTop: '1px solid #f1f5f9'
                                }}>
                                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                                        Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, filteredLogs.length)} of {filteredLogs.length} entries
                                    </div>

                                    <div className="pagination-controls" style={{ display: 'flex', gap: '5px' }}>
                                        <button 
                                            className="page-nav-btn"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(prev => prev - 1)}
                                            style={navBtnStyle}
                                        >
                                            <ChevronLeft size={16} /> Previous
                                        </button>

                                        {getPaginationGroup().map((item) => (
                                            <button
                                                key={item}
                                                onClick={() => setCurrentPage(item)}
                                                style={{
                                                    ...pageNumStyle,
                                                    backgroundColor: currentPage === item ? '#3b82f6' : 'transparent',
                                                    color: currentPage === item ? '#fff' : '#64748b',
                                                    border: currentPage === item ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                                                    fontWeight: currentPage === item ? '600' : '400'
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

const navBtnStyle = {
    display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s'
};

const pageNumStyle = {
    minWidth: '36px', height: '36px', padding: '0 6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s'
};

export default AuditLogList;