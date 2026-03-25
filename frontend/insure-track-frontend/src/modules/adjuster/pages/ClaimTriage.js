 
import { useState, useEffect } from "react";
import { Filter, FileText, RefreshCw, AlertCircle, UserCheck } from "lucide-react";
import { claimsApi, assignmentApi } from "../../../core/services/api";
import { useNotifications } from "./NotificationContext";
import '../styles/adjuster.css';
 
function badgeClass(status) {
  const map = {
    OPEN: "adj-badge adj-badge-open",
    INVESTIGATING: "adj-badge adj-badge-investigating",
    ADJUDICATED: "adj-badge adj-badge-adjudicated",
    SETTLED: "adj-badge adj-badge-settled",
    DENIED: "adj-badge adj-badge-denied",
    CLOSED: "adj-badge adj-badge-closed",
  };
  return map[status] || "adj-badge adj-badge-closed";
}
 
export function ClaimTriage() {
  const [claims, setClaims] = useState([]);
  const [selected, setSelected] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [priority, setPriority] = useState("HIGH");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const { refresh } = useNotifications();
 
  const user = JSON.parse(localStorage.getItem("user"));
 
  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };
 
  const loadClaims = async () => {
    setFetching(true);
    try {
      const res = await claimsApi.getByStatus("INVESTIGATING");
      const data = res.data || [];
     
      // LOGIC: We only show claims that DON'T have an assignment yet
      // This is a front-end filter, but your backend getByStatus might return all.
      // If you want them to disappear, we filter out assigned ones.
      const unassigned = [];
      for(const claim of data) {
        try {
           const assignRes = await assignmentApi.getByClaim(claim.claimId);
           if (!assignRes.data) unassigned.push(claim);
        } catch(e) {
           unassigned.push(claim);
        }
      }
 
      setClaims(unassigned);
      if (unassigned.length > 0) {
        handleSelect(unassigned[0]);
      } else {
        setSelected(null);
      }
    } catch (err) {
      showToast("error", "Could not load claims: " + err.message);
    } finally {
      setFetching(false);
    }
  };
 
  const loadAssignment = async (claimId) => {
    setAssignment(null);
    try {
      const res = await assignmentApi.getByClaim(claimId);
      setAssignment(res.data);
    } catch (_) {}
  };
 
  useEffect(() => {
    loadClaims();
  }, []);
 
  const handleSelect = (c) => {
    setSelected(c);
    loadAssignment(c.claimId);
  };
 
  const handleAssign = async () => {
    if (!selected || !user) return;
    setLoading(true);
    try {
      const res = await assignmentApi.assign(selected.claimId, {
        adjusterId: user.userId,
        priority,
      });
     
      refresh();
      showToast("success", `Claim #${selected.claimId} assigned and moved to queue.`);
     
      // LOGIC: Remove from the sidebar list immediately
      const updatedClaims = claims.filter(c => c.claimId !== selected.claimId);
      setClaims(updatedClaims);
     
      // Select next claim or clear selection
      if (updatedClaims.length > 0) {
        handleSelect(updatedClaims[0]);
      } else {
        setSelected(null);
        setAssignment(null);
      }
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="adj-page">
      {/* 1. Header Section */}
      <div className="adj-page-header">
        <div>
          <h1 className="adj-page-title">Claim Triage</h1>
          <p className="adj-page-sub">Assign pending investigations and set priorities</p>
        </div>
        <button onClick={loadClaims} disabled={fetching} className="adj-refresh-btn">
          <RefreshCw size={14} className={fetching ? "adj-spin" : ""} /> Refresh
        </button>
      </div>
 
      {/* 2. Loading State */}
      {fetching ? (
        <div className="adj-loading">
          <RefreshCw size={24} className="adj-spin" />
          <span>Fetching investigations...</span>
        </div>
      ) : claims.length === 0 ? (
        <div className="adj-empty">
          <div className="adj-empty-icon">
            <Filter size={48} strokeWidth={1.5} />
          </div>
          <p className="adj-empty-title">No pending triage</p>
          <p className="adj-empty-sub">All investigations have been assigned to adjusters.</p>
        </div>
      ) : (
        <div className="adj-split">
         
          {/* SIDEBAR: Claims List */}
          <div className="adj-list-panel">
            <div className="adj-list-panel-header">
              {claims.length} Ready to Assign
            </div>
            <div className="adj-list-scroll">
              {claims.map((c) => (
                <button
                  key={c.claimId}
                  onClick={() => handleSelect(c)}
                  className={`adj-list-item ${selected?.claimId === c.claimId ? "selected" : ""}`}
                >
                  <div className="adj-list-item-top">
                    <span className="adj-list-item-id">#{c.claimId}</span>
                    <span className={badgeClass(c.status)}>{c.status}</span>
                  </div>
                  <p className="adj-list-item-type">{c.claimType}</p>
                  <p className="adj-list-item-meta">{c.policyNumber || `#${c.policyId}`}</p>
                </button>
              ))}
            </div>
          </div>
 
          {/* RIGHT COLUMN: Detail Area */}
          <div className="adj-detail-col">
            {selected ? (
              <div className="adj-row" style={{ alignItems: "flex-start", gap: "16px" }}>
               
                {/* Claim Info Card */}
                <div className="adj-card" style={{ flex: 1.2 }}>
                  <p className="adj-card-title">Claim Details</p>
                  <div className="adj-col" style={{ gap: "10px" }}>
                    <div className="adj-row-between">
                      <span style={{fontSize: "12px", color: "#6b7280"}}>Policy</span>
                      <strong style={{fontSize: "13px", fontFamily: 'monospace'}}>{selected.policyNumber || `#${selected.policyId}`}</strong>
                    </div>
                    <div className="adj-row-between">
                      <span style={{fontSize: "12px", color: "#6b7280"}}>Incident Date</span>
                      <strong style={{fontSize: "13px"}}>{selected.incidentDate}</strong>
                    </div>
                    <p style={{fontSize: "11px", color: "#6b7280", marginTop: "10px", marginBottom: "4px"}}>Description</p>
                    <p className="adj-desc-box" style={{fontSize: "12px"}}>{selected.description}</p>
                  </div>
                </div>
 
                {/* Assignment Control Card */}
                <div className="adj-card" style={{ flex: 1 }}>
                  <p className="adj-card-title">Assignment Manager</p>
                  <div className="adj-adjuster-card" style={{ padding: "10px", marginBottom: "12px", background: '#f8fafc' }}>
                    <div className="adj-adjuster-card-avatar" style={{width: "32px", height: "32px", fontSize: "11px"}}>
                      {user?.name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div style={{fontSize: "12px"}}>
                      <strong>{user?.name}</strong>
                      <br/>
                      <span style={{color: "#6b7280"}}>ID: {user?.userId}</span>
                    </div>
                  </div>
 
                  <p className="adj-form-label" style={{fontSize: "11px", fontWeight: '600'}}>Set Priority</p>
                  <div className="adj-priority-grid" style={{marginBottom: "20px"}}>
                    {["LOW", "MEDIUM", "HIGH"].map(p => (
                      <button
                        key={p}
                        onClick={() => setPriority(p)}
                        className={`adj-priority-btn ${priority === p ? `selected-${p.toLowerCase()}` : ""}`}
                        style={{padding: "8px", fontSize: "10px"}}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
 
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={handleAssign}
                      disabled={loading}
                      className="adj-btn adj-btn-primary"
                      style={{ padding: '10px 20px', fontSize: '13px' }}
                    >
                      {loading ? "Processing..." : "Assign →"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="adj-empty" style={{ padding: "60px 20px", borderStyle: 'dashed' }}>
                <UserCheck size={32} style={{ color: '#cbd5e1', marginBottom: '12px' }} />
                <p className="adj-empty-sub">Select a claim from the left to start triage.</p>
              </div>
            )}
          </div>
        </div>
      )}
 
      {/* 5. Floating Toast Notification (Stops the Dancing) */}
      {toast && (
        <div className={`adj-toast ${toast.type === "success" ? "adj-toast-success" : "adj-toast-error"}`}>
          <AlertCircle size={16} />
          <span>{toast.text}</span>
        </div>
      )}
    </div>
  );
}