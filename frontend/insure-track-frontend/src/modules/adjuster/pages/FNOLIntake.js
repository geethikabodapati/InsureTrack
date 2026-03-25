import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText, CheckCircle, RefreshCw, AlertCircle,
  PlusCircle, Image as ImageIcon, Upload, Film, File
} from "lucide-react";
import { claimsApi, customerClaimsApi } from "../../../core/services/api";
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
 
const DEFAULT_CLAIM_TYPES = ["AUTO", "PROPERTY", "HEALTH", "LIFE", "COMMERCIAL"];
const EVIDENCE_TYPES = ["PHOTO", "VIDEO", "DOCUMENT", "RECEIPT", "POLICE_REPORT", "MEDICAL_RECORD"];
const ACTIVE_STATUSES = ["OPEN", "INVESTIGATING", "SETTLED", "ADJUDICATED"];
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_TYPES = "image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt";
 
function FileIcon({ file }) {
  if (!file) return <Upload size={22} strokeWidth={2} />;
  if (file.type.startsWith("image/")) return <ImageIcon size={22} strokeWidth={2} />;
  if (file.type.startsWith("video/")) return <Film size={22} strokeWidth={2} />;
  return <File size={22} strokeWidth={2} />;
}
 
export function FNOLIntake() {
  const [tab, setTab] = useState("incoming");
  const [openClaims, setOpenClaims] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [toast, setToast] = useState(null);
 
  // File New Claim state
  const [step, setStep] = useState("evidence"); // evidence | form | done
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidenceType, setEvidenceType] = useState("PHOTO");
  const [fileError, setFileError] = useState("");
  const [form, setForm] = useState({ policyId: "", incidentDate: "", claimType: "", description: "" });
  const [filedClaim, setFiledClaim] = useState(null);
 
  // Policy validation
  const [policyInfo, setPolicyInfo] = useState(null);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [policyError, setPolicyError] = useState("");
  const [claimTypes, setClaimTypes] = useState(DEFAULT_CLAIM_TYPES);
 
  const isDescTooLong = form.description.length > 20;
 
  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 5000);
  };
 
  const loadOpenClaims = useCallback(async () => {
    setFetching(true);
    try {
      const res = await claimsApi.getByStatus("OPEN");
      const data = res.data || [];
      setOpenClaims(data);
      if (data.length > 0) setSelected(data[0]);
      else setSelected(null);
    } catch (_) {
      showToast("error", "Failed to load incoming claims");
    } finally {
      setFetching(false);
    }
  }, []);
 
  useEffect(() => { loadOpenClaims(); }, [loadOpenClaims]);
 
  const fetchPolicyInfo = useCallback(async (pId) => {
    if (!pId || isNaN(pId)) { setPolicyInfo(null); setPolicyError(""); return; }
    setPolicyLoading(true); setPolicyError("");
    try {
      const res = await claimsApi.getPolicyInfo(parseInt(pId));
      const policy = res.data;
      setPolicyInfo(policy);
 
      const allRes = await claimsApi.getAll();
      const existing = (allRes.data || []).find(c =>
        c.policyId === parseInt(pId) && ACTIVE_STATUSES.includes(c.status)
      );
 
      if (existing) {
        setPolicyError(`Active claim #${existing.claimId} (${existing.status}) exists.`);
      } else if (policy.status !== "ACTIVE") {
        setPolicyError(`Policy is ${policy.status}. Only ACTIVE allowed.`);
      }
 
      const covRes = await claimsApi.getPolicyCoverages(parseInt(pId));
      const types = covRes.data?.length > 0 ? covRes.data : DEFAULT_CLAIM_TYPES;
      setClaimTypes(types);
      setForm(prev => ({ ...prev, claimType: types[0] || "" }));
    } catch (err) {
      setPolicyError("Policy ID not found.");
      setPolicyInfo(null);
    } finally {
      setPolicyLoading(false);
    }
  }, []);
 
  useEffect(() => {
    const t = setTimeout(() => { if (form.policyId) fetchPolicyInfo(form.policyId); }, 600);
    return () => clearTimeout(t);
  }, [form.policyId, fetchPolicyInfo]);
 
  const dateError = (() => {
    if (!form.incidentDate || !policyInfo) return "";
    const incident = new Date(form.incidentDate);
    const effective = new Date(policyInfo.effectiveDate);
    const expiry = new Date(policyInfo.expiryDate);
    const today = new Date(); today.setHours(23, 59, 59);
    if (incident < effective) return `Must be after ${policyInfo.effectiveDate}`;
    if (incident > expiry) return `Expired on ${policyInfo.expiryDate}`;
    if (incident > today) return "Cannot be in future.";
    return "";
  })();
 
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError("");
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File size exceeds ${MAX_FILE_SIZE_MB}MB.`);
      setEvidenceFile(null);
      return;
    }
    if (file.type.startsWith("video/")) setEvidenceType("VIDEO");
    else if (file.type.startsWith("image/")) setEvidenceType("PHOTO");
    else setEvidenceType("DOCUMENT");
    setEvidenceFile(file);
  };
 
  const handleSubmitAll = async (e) => {
    e.preventDefault();
    if (policyError || dateError || isDescTooLong || !evidenceFile) {
      showToast("error", "Please fix errors before submitting.");
      return;
    }
    setLoading(true);
    try {
      const claimRes = await customerClaimsApi.fileClaim(form);
      const newClaim = claimRes.data;
     
      const fd = new FormData();
      fd.append("metadata", JSON.stringify({ type: evidenceType }));
      fd.append("file", evidenceFile);
      await customerClaimsApi.uploadEvidence(newClaim.claimId, fd);
      await claimsApi.moveToReview(newClaim.claimId);
 
      setFiledClaim(newClaim);
      setStep("done");
      loadOpenClaims();
      showToast("success", "Claim created successfully!");
    } catch (err) {
      showToast("error", "Submission failed.");
    } finally {
      setLoading(false);
    }
  };
 
  const resetAll = () => {
    setStep("evidence");
    setForm({ policyId: "", incidentDate: "", claimType: "", description: "" });
    setFiledClaim(null); setEvidenceFile(null); setFileError("");
    setPolicyInfo(null); setPolicyError("");
  };
 
  return (
    <div className="adj-page">
      {/* --- Page Header --- */}
      <div className="adj-page-header">
        <h1 className="adj-page-title">FNOL Intake</h1>
        <button onClick={loadOpenClaims} className="adj-refresh-btn" disabled={fetching}>
          <RefreshCw size={14} strokeWidth={2} className={fetching ? "adj-spin" : ""} /> Refresh
        </button>
      </div>
 
      {/* --- Tabs --- */}
      <div className="adj-tabs">
        <button onClick={() => setTab("incoming")} className={`adj-tab ${tab === "incoming" ? "active" : ""}`}>
          Incoming ({openClaims.length})
        </button>
        <button onClick={() => setTab("file")} className={`adj-tab ${tab === "file" ? "active" : ""}`}>
          File New Claim
        </button>
      </div>
 
      {/* --- Incoming Tab --- */}
      {tab === "incoming" && (
        fetching ? (
          <div className="adj-loading"><RefreshCw size={24} strokeWidth={2} className="adj-spin" /><span>Loading...</span></div>
        ) : openClaims.length === 0 ? (
          <div className="adj-empty">
            <div className="adj-empty-icon"><FileText size={44} strokeWidth={1.5} /></div>
            <p className="adj-empty-title">0 New Claims</p>
            <p className="adj-empty-sub">Use "File New Claim" to start a new record.</p>
          </div>
        ) : (
          <div className="adj-split">
            <div className="adj-list-panel">
              <div className="adj-list-panel-header">{openClaims.length} New Claims</div>
              <div className="adj-list-scroll">
                {openClaims.map(c => (
                  <button key={c.claimId} onClick={() => setSelected(c)}
                    className={`adj-list-item ${selected?.claimId === c.claimId ? "selected" : ""}`}>
                    <div className="adj-list-item-top">
                      <span className="adj-list-item-id">#{c.claimId}</span>
                      <span className={badgeClass(c.status)}>{c.status}</span>
                    </div>
                    <p className="adj-list-item-type">{c.claimType}</p>
                    <p className="adj-list-item-meta" style={{ fontSize: 10 }}>{c.policyNumber || `#${c.policyId}`} · {c.reportedDate}</p>
                  </button>
                ))}
              </div>
            </div>
 
            {selected && (
              <div className="adj-detail-col">
                <div className="adj-card">
                  <div className="adj-data-grid">
                    <div className="adj-data-item"><p className="adj-data-label">Policy</p><p className="adj-data-value">{selected.policyNumber || selected.policyId}</p></div>
                    <div className="adj-data-item"><p className="adj-data-label">Date</p><p className="adj-data-value">{selected.incidentDate}</p></div>
                  </div>
                  <p className="adj-data-label" style={{marginTop: 16}}>Loss Description</p>
                  <p className="adj-desc-box">{selected.description}</p>
                  <button onClick={async () => { await claimsApi.moveToReview(selected.claimId); loadOpenClaims(); }}
                    className="adj-btn adj-btn-primary" style={{ marginTop: 16 }}>
                    Investigate
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      )}
 
      {/* --- File Claim Tab --- */}
      {tab === "file" && (
        <div className="adj-fnol-centered">
          <div className="adj-steps" style={{ marginBottom: 20 }}>
            {[{k:"evidence", l:"1. Evidence"}, {k:"form", l:"2. Details"}, {k:"done", l:"3. Done"}].map((s, i) => (
              <div key={s.k} className={`adj-step ${step === s.k ? "current" : (step==="form" && i===0) || step==="done" ? "done" : "upcoming"}`}>{s.l}</div>
            ))}
          </div>
 
          {step === "evidence" && (
            <div className="adj-card">
              <p className="adj-card-title">Step 1: Upload Support Media</p>
              <div className="adj-form-group">
                <div className="adj-upload-area" style={{ position: 'relative', border: fileError ? '2px dashed #dc2626' : evidenceFile ? '2px dashed #3b82f6' : '' }}>
                  <input type="file" accept={ACCEPTED_TYPES} onChange={handleFileChange} style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }}/>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: evidenceFile ? '#3b82f6' : '#d1d5db', marginBottom: 8, display:'flex', justifyContent:'center' }}><FileIcon file={evidenceFile}/></div>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{evidenceFile ? evidenceFile.name : "Click to select image or video"}</p>
                    <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Max size: 5MB</p>
                  </div>
                </div>
                {fileError && <p className="adj-field-error" style={{ marginTop: 8 }}><AlertCircle size={12}/> {fileError}</p>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setStep("form")} disabled={!evidenceFile || !!fileError} className="adj-btn adj-btn-primary">Claim Details →</button>
              </div>
            </div>
          )}
 
          {step === "form" && (
            <div className="adj-card">
              <form onSubmit={handleSubmitAll}>
                <div className="adj-form-group">
                  <label className="adj-form-label">Policy ID</label>
                  <input required type="number" value={form.policyId} onChange={e => setForm({...form, policyId: e.target.value})} className="adj-input"/>
                  {policyInfo && !policyError && (
                    <div style={{marginTop: 6, padding: '8px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0'}}>
                      <p style={{color:"#16a34a", fontSize:11, fontWeight: '600'}}>✓ {policyInfo.policyNumber}</p>
                      <p style={{color:"#166534", fontSize:10}}>Validity: {policyInfo.effectiveDate} to {policyInfo.expiryDate}</p>
                    </div>
                  )}
                  {policyError && <p className="adj-field-error"><AlertCircle size={12}/> {policyError}</p>}
                </div>
                <div className="adj-form-group">
                  <label className="adj-form-label">Incident Date</label>
                  <input required type="date" value={form.incidentDate} onChange={e => setForm({...form, incidentDate: e.target.value})} className="adj-input"/>
                  {dateError && <p className="adj-field-error"><AlertCircle size={12}/> {dateError}</p>}
                </div>
                <div className="adj-form-group">
                  <label className="adj-form-label">Claim Type</label>
                  <select required value={form.claimType} onChange={e => setForm({...form, claimType: e.target.value})} className="adj-select">
                    {claimTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="adj-form-group">
                  <label className="adj-form-label">Description</label>
                  <textarea required rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="adj-textarea"/>
                  <div style={{textAlign:'right', fontSize:10, color: isDescTooLong ? '#dc2626' : '#9ca3af'}}>{form.description.length}/20</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button type="button" onClick={() => setStep("evidence")} className="adj-btn adj-btn-gray">← Back</button>
                  <button type="submit" disabled={loading || !!policyError || !!dateError || isDescTooLong} className="adj-btn adj-btn-primary">
                    {loading ? "Creating..." : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          )}
 
          {step === "done" && (
            <div className="adj-card adj-done-screen">
              <div className="adj-done-icon"><CheckCircle size={48} strokeWidth={1.5} /></div>
              <h2 className="adj-done-title">Success!</h2>
              <p className="adj-done-sub">Claim <strong>#{filedClaim?.claimId}</strong> is now in investigation.</p>
              <div className="adj-done-actions" style={{marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12}}>
                 <button onClick={() => setTab("incoming")} className="adj-btn adj-btn-gray">View Queue</button>
                 <button onClick={resetAll} className="adj-btn adj-btn-primary"><PlusCircle size={14}/> File Another</button>
              </div>
            </div>
          )}
        </div>
      )}
 
      {toast && (
        <div className={`adj-toast-fixed adj-toast-${toast.type}`}>
          <AlertCircle size={15} /> {toast.text}
        </div>
      )}
    </div>
  );
}