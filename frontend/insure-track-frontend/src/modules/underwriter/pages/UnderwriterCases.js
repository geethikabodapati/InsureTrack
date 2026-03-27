import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getAllCases } from '../../../../src/core/services/api.js';
import { RefreshCw, Eye, ClipboardCheck } from 'lucide-react'; 
import '../styles/underwriter.css';
import { useNavigate } from 'react-router-dom';

const UnderwritingCases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); 
  const navigate = useNavigate();

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllCases();
      console.log(response);
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

  const filteredCases = useMemo(() => {
    if (filter === 'ALL') return cases;
    return cases.filter(item => item.decision?.toUpperCase() === filter);
  }, [filter, cases]);

  if (loading) return <div className="loader">Loading cases...</div>;

  return (
    <div className="cases-container">
      <div className="table-header">
        <h2>Underwriting Cases ({filteredCases.length})</h2>
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
            <th style={{ textAlign:'left',paddingLeft:'27px'}}>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredCases.map((item) => {
            const isPending = item.decision?.toUpperCase() === 'PENDING';
            return (
              <tr key={item.uwCaseId}>
                <td>{item.uwCaseId}</td>
                <td>{item.customerName}</td>
                <td>
                  <span className={`badge-score ${item.riskScore >= 3 ? 'high' : 'low'}`}>
                    {item.riskScore  >= 3 ? 'High' : 'Low' || 0}
                  </span>
                </td>
                <td>
                  <span>
                    {item.coverageAmount || 0}
                  </span>
                </td>
                <td>
                  <span>
                    {item.policyType || 'NA'}
                  </span>
                </td>
                <td style={{ textAlign: 'left', paddingLeft: '15px' }}>
  <span 
    className={`status-pill ${item.decision?.toLowerCase()}`}>
    {item.decision}
  </span>
</td>
                <td>
                  <button 
                    className={`view-btn ${!isPending ? 'read-only' : ''}`}
                    onClick={() => navigate(`/underwriter-dashboard/lookup-case/${item.uwCaseId}`)}
                  >
                    {isPending ? <><ClipboardCheck size={16} /> </> : <><Eye size={16} /></>}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UnderwritingCases;