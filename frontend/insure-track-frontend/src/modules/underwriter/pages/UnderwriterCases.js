import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getAllCases } from '../../../../src/core/services/api.js';
import { RefreshCw, Eye, ClipboardCheck, ChevronLeft, ChevronRight } from 'lucide-react'; 
import '../styles/underwriter.css';
import { useNavigate } from 'react-router-dom';

const UnderwritingCases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const navigate = useNavigate();

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllCases();
      const actualData = response.data.content || response.data;
      setCases(Array.isArray(actualData) ? actualData : []);
    } catch (error) {
      console.error("Error fetching cases:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  // Reset to page 1 whenever filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const processedCases = useMemo(() => {
    let result = [...cases];

    if (filter !== 'ALL') {
      result = result.filter(item => item.decision?.toUpperCase() === filter);
    }

    return result.sort((a, b) => {
      // If new Date(b.createdDate) - new Date(a.createdDate)
      // Otherwise, use the ID as a proxy for "recent"
      return b.uwCaseId - a.uwCaseId; 
    });
  }, [filter, cases]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedCases.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(processedCases.length / itemsPerPage);

  if (loading) return <div className="loader">Loading cases...</div>;

  return (
    <div className="cases-container">
      <div className="table-header">
        <h2>Underwriting Cases ({processedCases.length})</h2>
        <div className="header-actions">
          <select 
            className="status-filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">All Cases</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVE">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <button className="refresh-btn-icon" onClick={fetchCases}>
            <RefreshCw size={18} className={loading ? "spin" : ""} />
          </button>
        </div>
      </div>
      
      <table className="cases-table">
        <thead>
          <tr>
            <th>Case ID</th>
            <th>Name</th>
            <th>Risk Assessment</th>
            <th>Coverage Amount</th>
            <th>Product Type</th>
            <th style={{ textAlign:'left', paddingLeft:'27px'}}>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item) => {
            const isPending = item.decision?.toUpperCase() === 'PENDING';
            return (
              <tr key={item.uwCaseId}>
                <td>{item.uwCaseId}</td>
                <td>{item.customerName}</td>
                <td>
                  <span className={`badge-score ${item.riskScore >= 3 ? 'high' : 'low'}`}>
                    {item.riskScore >= 3 ? 'High' : 'Low'}
                  </span>
                </td>
                <td>{item.coverageAmount || 0}</td>
                <td>{item.policyType || 'NA'}</td>
                <td style={{ textAlign: 'left', paddingLeft: '15px' }}>
                  <span className={`status-pill ${item.decision?.toLowerCase()}`}>
                    {item.decision}
                  </span>
                </td>
                <td>
                  <button 
                    className={`view-btn ${!isPending ? 'read-only' : ''}`}
                    onClick={() => navigate(`/underwriter-dashboard/lookup-case/${item.uwCaseId}`)}
                  >
                    {isPending ? <ClipboardCheck size={16} /> : <Eye size={16} />}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {processedCases.length > 0 && (
        <div className="pagination-footer">
          <span className="page-info">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, processedCases.length)} of {processedCases.length}
          </span>
          <div className="pagination-controls">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="page-btn"
            >
              <ChevronLeft size={16} />
            </button>
            
            <span className="current-page-num">{currentPage} / {totalPages}</span>

            <button 
              disabled={currentPage === totalPages} 
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="page-btn"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnderwritingCases;