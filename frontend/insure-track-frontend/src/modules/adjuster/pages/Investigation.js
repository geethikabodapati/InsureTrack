import { useState, useEffect } from "react";
import { FileText, CheckCircle, XCircle, RefreshCw, AlertCircle, UserCheck } from "lucide-react";
import { claimsApi, evidenceApi, assignmentApi } from "../../../core/services/api";
import { useNotifications } from "./NotificationContext";
import '../styles/adjuster.css';
 
function badgeClass(s) {
  const m = {
    OPEN: "adj-badge adj-badge-open",
    INVESTIGATING: "adj-badge adj-badge-investigating",
    ADJUDICATED: "adj-badge adj-badge-adjudicated",
    SETTLED: "adj-badge adj-badge-settled",
    DENIED: "adj-badge adj-badge-denied",
    CLOSED: "adj-badge adj-badge-closed",
  };
  return m[s] || "adj-badge adj-badge-closed";
}
const BASE_URL = "http://localhost:8082";
function isImage(uri) {
  if (!uri) return false;
  return /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(uri);
}
 
const getFileViewUrl = (fileUri) => {
    if (!fileUri || typeof fileUri !== 'string') return "";
    const filename = fileUri.split(/[\\/]/).pop();
    const safeFilename = encodeURIComponent(filename); // Handle spaces
    return `${BASE_URL}/docs/${safeFilename}`;
  };
export function Investigation() {
  const [claims, setClaims] = useState([]);
  const [selected, setSelected] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const { refresh } = useNotifications();
  const [viewFile, setViewFile] = useState(null);
 
  const user = JSON.parse(localStorage.getItem("user"));
  const showToast = (type, text) => { setToast({ type, text }); setTimeout(() => setToast(null), 6000); };
 
  const loadClaims = async () => {
    setFetching(true);
    try {
      const res = await claimsApi.getByStatus("INVESTIGATING");
      setClaims(res.data || []);
      if (res.data?.length > 0) selectClaim(res.data[0]);
      else setSelected(null); // Clear selection if no claims
    } catch (err) { showToast("error", "Could not load claims: " + err.message); }
    finally { setFetching(false); }
  };
 
  const selectClaim = async (c) => {
    if (!c) return;
    setSelected(c);
    setEvidence([]);
    setAssignment(null);
    try {
      const [eRes, aRes] = await Promise.all([
        evidenceApi.getByClaim(c.claimId).catch(() => ({ data: [] })),
        assignmentApi.getByClaim(c.claimId).catch(() => ({ data: null })),
      ]);
      setEvidence(Array.isArray(eRes.data) ? eRes.data : []);
      setAssignment(aRes.data || null);
    } catch (_) {}
  };
 
  useEffect(() => { loadClaims(); }, []);
 
  const handleApprove = async () => {
    if (!assignment) { showToast("error", "⚠ Assign in Triage first."); return; }
    setLoading(true);
    try {
      const res = await claimsApi.approve(selected.claimId);
      refresh();
      showToast("success", `Claim #${selected.claimId} → ADJUDICATED. Move to Reserves.`);
     
      // LOGIC: Remove from sidebar immediately
      const updated = claims.filter(c => c.claimId !== selected.claimId);
      setClaims(updated);
      if (updated.length > 0) selectClaim(updated[0]);
      else setSelected(null);
 
    } catch (err) { showToast("error", err.message); }
    finally { setLoading(false); }
  };
 
  const handleReject = async () => {
    if (!assignment) { showToast("error", "⚠ Assign in Triage first."); return; }
    setLoading(true);
    try {
      await claimsApi.reject(selected.claimId);
      showToast("error", `Claim #${selected.claimId} → DENIED`);
     
      // LOGIC: Remove from sidebar immediately
      const updated = claims.filter(c => c.claimId !== selected.claimId);
      setClaims(updated);
      if (updated.length > 0) selectClaim(updated[0]);
      else setSelected(null);
 
    } catch (err) { showToast("error", err.message); }
    finally { setLoading(false); }
  };
 
  return (
    <div className="adj-page">
      <div className="adj-page-header">
        <div>
          <h1 className="adj-page-title">Investigation</h1>
          <p className="adj-page-sub">Review evidence and Adjudicate claims</p>
        </div>
        <button onClick={loadClaims} disabled={fetching} className="adj-refresh-btn">
          <RefreshCw size={14} className={fetching ? "adj-spin" : ""} /> Refresh
        </button>
      </div>
 
      {toast && (
        <div className={`adj-toast ${toast.type === "success" ? "adj-toast-success" : "adj-toast-error"}`}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />{toast.text}
        </div>
      )}
 
      {fetching ? (
        <div className="adj-loading"><RefreshCw size={24} className="adj-spin" /><span>Fetching...</span></div>
      ) : claims.length === 0 ? (
        <div className="adj-empty"><div className="adj-empty-icon"><FileText size={48} /></div><p className="adj-empty-title">No investigations pending</p></div>
      ) : (
        <div className="adj-split">
          {/* Sidebar */}
          <div className="adj-list-panel">
            <div className="adj-list-panel-header">{claims.length} Investigations</div>
            <div className="adj-list-scroll">
              {claims.map(c => (
                <button key={c.claimId} onClick={() => selectClaim(c)} className={`adj-list-item ${selected?.claimId === c.claimId ? "selected" : ""}`}>
                  <div className="adj-list-item-top">
                    <span className="adj-list-item-id">#{c.claimId}</span>
                    {/* Dynamic Badge Color */}
                    <span className={badgeClass(c.status)}>{c.status}</span>
                  </div>
                  <p className="adj-list-item-type">{c.claimType}</p>
                  <p className="adj-list-item-meta">{c.policyNumber || `#${c.policyId}`}</p>
                </button>
              ))}
            </div>
          </div>
 
          {selected && (
            <div className="adj-detail-col">
              <div className="adj-card">
                <div className="adj-card-header">
                  <p className="adj-card-title">Case Details</p>
                  {/* Dynamic Badge Color Fix */}
                  <span className={badgeClass(selected.status)}>{selected.status}</span>
                </div>
                <div className="adj-data-grid" style={{ marginBottom: 12 }}>
                  {[
                    ["Policy", selected.policyNumber || `#${selected.policyId}`],
                    ["Type", selected.claimType],
                    ["Incident", selected.incidentDate],
                    ["Reported", selected.reportedDate]
                  ].map(([k, v]) => (
                    <div key={k} className="adj-data-item">
                      <p className="adj-data-label">{k}</p>
                      <p className="adj-data-value">{v}</p>
                    </div>
                  ))}
                </div>
                <p className="adj-data-label">Loss Description</p>
                <p className="adj-desc-box">{selected.description}</p>
              </div>
 
              {/* Assignment Banner */}
              <div className={`adj-assign-banner ${assignment ? "assigned" : "unassigned"}`}>
                <UserCheck size={16} style={{ color: assignment ? "#16a34a" : "#ea580c" }} />
                <div>
                  <p className="adj-assign-title">{assignment ? `✓ Assigned to You` : "⚠ Not yet assigned"}</p>
                  <p className="adj-assign-sub">{assignment ? `Priority: ${assignment.priority} · Date: ${assignment.assignmentDate}` : "Go to Triage first."}</p>
                </div>
              </div>
 
              {/* Evidence Section */}
              <div className="adj-card">
                <p className="adj-card-title">Evidence Files ({evidence.length})</p>
                {evidence.length === 0 ? <p className="adj-empty-sub">No files uploaded</p> : evidence.map(e => (
                  <div key={e.evidenceId} className="adj-evidence-item">
                    <FileText size={16} />
                    <div style={{ flex: 1 }}>
                      <span className="adj-evidence-id">#{e.evidenceId}</span>
                      <span className="adj-evidence-type" style={{ marginLeft: 8 }}>{e.type}</span>
                      <p className="adj-evidence-meta">{e.uploadedDate}</p>
                    </div>
                    <button
          className="adj-evidence-view-btn"
          onClick={() => isImage(e.uri) ? setViewFile(e) : window.open(getFileViewUrl(e.uri), "_blank")}
        >
          View
        </button>
                  </div>
                ))}
              </div>
             
 
              {/* Actions */}
              <div className="adj-card">
                <p className="adj-card-title">Final Decision</p>
                <div style={{ display: "flex", gap: 12 }}>
                   <button onClick={handleApprove} disabled={loading || !assignment} className="adj-btn adj-btn-teal adj-btn-full">
                    <CheckCircle size={14} /> ADJUDICATE
                   </button>
                   <button onClick={handleReject} disabled={loading || !assignment} className="adj-btn adj-btn-danger adj-btn-full">
                    <XCircle size={14} /> DENY
                   </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {viewFile && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.85)", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", zIndex: 9999, backdropFilter: "blur(5px)"
        }} onClick={() => setViewFile(null)}>
          <div style={{ position: "relative", width: "90%", maxWidth: "800px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewFile(null)} style={{ position: "absolute", top: "-40px", right: "0", background: "none", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
              <XCircle size={20} /> Close
            </button>
            <div style={{ width: "100%", maxHeight: "70vh", background: "#000", borderRadius: "12px", overflow: "hidden", display: "flex", justifyContent: "center" }}>
              <img src={getFileViewUrl(viewFile.uri)} alt="Preview" style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}