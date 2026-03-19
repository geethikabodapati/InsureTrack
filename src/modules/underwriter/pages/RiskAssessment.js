import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCaseById, submitUnderwritingDecision } from '../../../../src/core/services/api.js'; 
import { CheckCircle, XCircle, Search, ShieldAlert, Lock, FileText } from 'lucide-react';
import '../styles/underwriter.css';

const RiskAssessment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [searchInput, setSearchInput] = useState(id && id !== ":id" ? id : '');
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState('');

  const loadCase = async (caseId) => {
    if (!caseId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getCaseById(caseId);
      setCaseData(response.data);
      setComments(response.data.decisionNotes || '');
    } catch (err) {
      setError("Case not found. Please verify the Case ID.");
      setCaseData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && id !== ":id") {
      loadCase(id);
    }
  }, [id]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput) loadCase(searchInput);
  };

  const handleDecision = async (status) => {
    try {
      await submitUnderwritingDecision(caseData.uwCaseId, { 
        decision: status.toUpperCase(), 
        notes: comments 
      });
      alert(`Case successfully ${status.toLowerCase()}`);
      navigate('/underwriter-dashboard/cases');
    } catch (err) {
      alert("Submission failed. Check backend logs.");
    }
  };

  const isPending = caseData?.decision?.toUpperCase() === 'PENDING';

  return (
    <div className="assessment-container">
      {/* Search Header */}
      <div className="search-header-card">
        <form onSubmit={handleSearch} className="assessment-search-bar">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Enter Case ID to assess..." 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit">Lookup Case</button>
        </form>
      </div>

      {loading && <div className="loader">Fetching records...</div>}
      {error && <div className="error-message">{error}</div>}

      {caseData && (
        <div className="assessment-content-wrapper">
          <div className="assessment-header">
            <h2>Case Review: #{caseData.uwCaseId}</h2>
            <span className={`status-pill ${caseData.decision.toLowerCase()}`}>
              {caseData.decision}
            </span>
          </div>

          <div className="assessment-grid">
            <div className="info-card">
              <h3>Policy Overview</h3>
              <div className="info-row"><span>Customer:</span> <strong>{caseData.customerName}</strong></div>
              <div className="info-row"><span>Product:</span> <strong>{caseData.policyType}</strong></div>
              <div className="info-row"><span>Sum Insured:</span> <strong>${caseData.coverageAmount?.toLocaleString()}</strong></div>
              <div className="info-row"><span>Risk Score:</span> <strong>{caseData.riskScore}</strong></div>
            </div>

            {/* Conditional Rendering for Decision Card */}
            <div className="decision-card">
              {isPending ? (
                <>
                  <h3>Pending Decision</h3>
                  <textarea 
                    placeholder="Provide underwriting notes (required)..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                  />
                  <div className="decision-actions">
                    <button className="btn-approve" onClick={() => handleDecision('APPROVE')}>
                      <CheckCircle size={18} /> Approve Case
                    </button>
                    <button className="btn-decline" onClick={() => handleDecision('DECLINE')}>
                      <XCircle size={18} /> Decline Case
                    </button>
                  </div>
                </>
              ) : (
                <div className="readonly-view">
                  <div className="lock-icon-container">
                    <Lock size={32} color="#94a3b8" />
                  </div>
                  <h3>Decision Finalized</h3>
                  <p>Status: <strong className='text-success'>CLOSED</strong></p>
                  <div className="notes-box">
                    <strong>Underwriter Comments:</strong>
                    <p>{caseData.decisionNotes || "No notes were recorded for this decision."}</p>
                  </div>
                  {caseData.decision === 'APPROVE' && (
                    <button className="download-btn" onClick={() => window.print()}>
                      <FileText size={16} /> Print Report
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {!caseData && !loading && !error && (
        <div className="empty-state">
          <ShieldAlert size={48} color="#cbd5e1" />
          <p>Please search for a Case ID to review details.</p>
        </div>
      )}
    </div>
  );
};

export default RiskAssessment;