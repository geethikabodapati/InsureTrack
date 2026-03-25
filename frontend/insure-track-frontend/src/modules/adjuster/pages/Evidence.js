 
import { useState, useEffect } from "react";
import { FileText, RefreshCw, AlertCircle, Info, File, Image, ExternalLink, X } from "lucide-react";
import { evidenceApi, claimsApi } from "../../../core/services/api";
import '../styles/adjuster.css';
 
const BASE_URL = "http://localhost:8082";
 
function badgeClass(s) {
  const m = {
    INVESTIGATING: "adj-badge adj-badge-investigating",
    SETTLED:       "adj-badge adj-badge-settled",
    DENIED:        "adj-badge adj-badge-denied",
    CLOSED:        "adj-badge adj-badge-closed",
  };
  return m[s] || "adj-badge adj-badge-closed";
}
 
function isImage(uri) {
  if (!uri) return false;
  return /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(uri);
}
 
function isPDF(uri) {
  if (!uri) return false;
  return /\.pdf$/i.test(uri);
}
 
export function Evidence() {
  const [claims, setClaims] = useState([]);
  const [selected, setSelected] = useState(null);
  const [files, setFiles] = useState([]);
  const [toast, setToast] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [viewFile, setViewFile] = useState(null);
 
  const showToast = (type, text) => { setToast({ type, text }); setTimeout(() => setToast(null), 3000); };
 
  const loadClaims = async () => {
    setFetching(true);
    try {
      const res = await claimsApi.getAll();
      const rel = (res.data || []).filter(c => c.status !== "OPEN");
      setClaims(rel);
      if (rel.length > 0) selectClaim(rel[0]);
    } catch (err) { showToast("error", "Could not load claims: " + err.message); }
    finally { setFetching(false); }
  };
 
  const selectClaim = async (c) => {
    setSelected(c); setFiles([]);
    try {
      const res = await evidenceApi.getByClaim(c.claimId);
      setFiles(Array.isArray(res.data) ? res.data : []);
    } catch (_) {}
  };
 
  useEffect(() => { loadClaims(); }, []);
const getFileViewUrl = (fileUri) => {
  if (!fileUri || typeof fileUri !== 'string') return "";
 
  const filename = fileUri.split(/[\\/]/).pop();
 
  // encodeURIComponent fixes the spaces and brackets in "Screenshot (53).png"
  const safeFilename = encodeURIComponent(filename);
 
  return `${BASE_URL}/docs/${safeFilename}`;
};
 
  const handleView = (f) => {
    if (isImage(f.uri)) {
      setViewFile(f);
    } else {
      window.open(getFileViewUrl(f.uri), "_blank");
    }
  };
 
  return (
    <div className="adj-page">
      <div className="adj-page-header">
        <div>
          <h1 className="adj-page-title">Evidence</h1>
          <p className="adj-page-sub">Evidence submitted by customers — read only</p>
        </div>
        <button onClick={loadClaims} disabled={fetching} className="adj-refresh-btn">
          <RefreshCw size={14} className={fetching ? "adj-spin" : ""} /> Refresh
        </button>
      </div>
 
      <div className="adj-info-banner">
        <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
        <p>Evidence is uploaded by the <strong>customer</strong> when filing their claim.</p>
      </div>
 
      {toast && (
        <div className="adj-toast adj-toast-error">
          <AlertCircle size={16} style={{ flexShrink: 0 }} />{toast.text}
        </div>
      )}
 
      {/* Image viewer modal */}
      {/* Image viewer modal - Pure Popup Logic */}
{viewFile && (
  <div style={{
    position: "fixed",      // Idi important: Page tho sambandham lekunda fixed ga untundi
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.85)", // Semi-transparent black background
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,           // Screen paina anni elements kante paina untundi
    backdropFilter: "blur(5px)" // Background ni konchem blur chestundi pro look kosam
  }} onClick={() => setViewFile(null)}>
   
    {/* Modal Box */}
    <div style={{
      position: "relative",
      width: "90%",
      maxWidth: "900px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "20px"
    }} onClick={e => e.stopPropagation()}>
 
      {/* Close Button */}
      <button
        onClick={() => setViewFile(null)}
        style={{
          position: "absolute",
          top: "-40px",
          right: "0",
          background: "none",
          border: "none",
          color: "white",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "5px",
          fontSize: "14px"
        }}
      >
        <X size={20} /> Close
      </button>
 
      {/* Image Wrapper */}
      <div style={{
        width: "100%",
        maxHeight: "75vh",
        background: "#000",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center"
      }}>
        <img
          src={getFileViewUrl(viewFile.uri)}
          alt="Evidence Preview"
          style={{
            maxWidth: "100%",
            maxHeight: "75vh",
            objectFit: "contain"
          }}
        />
      </div>
 
      {/* Info & Action area below image */}
      <div style={{ textAlign: "center", color: "white" }}>
        <p style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "500" }}>
          Evidence #{viewFile.evidenceId} · {viewFile.type}
        </p>
        <button
          onClick={() => window.open(getFileViewUrl(viewFile.uri), "_blank")}
          style={{
            padding: "8px 20px",
            background: "#3b82f6",
            border: "none",
            borderRadius: "6px",
            color: "white",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <ExternalLink size={14} /> Open Full Size
        </button>
      </div>
    </div>
  </div>
)}
      {fetching ? (
        <div className="adj-loading"><RefreshCw size={24} className="adj-spin" /><span>Loading claims...</span></div>
      ) : claims.length === 0 ? (
        <div className="adj-empty">
          <div className="adj-empty-icon"><File size={48} /></div>
          <p className="adj-empty-title">No claims with evidence yet</p>
        </div>
      ) : (
        <div className="adj-split">
          <div className="adj-list-panel">
            <div className="adj-list-panel-header">{claims.length} Claims</div>
            <div className="adj-list-scroll">
              {claims.map(c => (
                <button key={c.claimId} onClick={() => selectClaim(c)}
                  className={`adj-list-item ${selected?.claimId === c.claimId ? "selected" : ""}`}>
                  <div className="adj-list-item-top">
                    <span className="adj-list-item-id">#{c.claimId}</span>
                    <span className={badgeClass(c.status)}>{c.status}</span>
                  </div>
                  <p className="adj-list-item-type">{c.claimType}</p>
                  <p className="adj-list-item-meta" style={{ fontSize: 10 }}>
                    {c.policyNumber || `#${c.policyId}`}
                  </p>
                </button>
              ))}
            </div>
          </div>
 
          {selected && (
            <div className="adj-table-wrap">
              <div className="adj-table-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>
                  Evidence for Claim #{selected.claimId}
                </span>
                <span className={badgeClass(selected.status)}>{selected.status}</span>
              </div>
 
              {files.length === 0 ? (
                <div className="adj-table-empty">
                  <File size={40} style={{ color: "#e5e7eb", margin: "0 auto 12px", display: "block" }} />
                  <p>No evidence files submitted</p>
                </div>
              ) : files.map(f => (
                <div key={f.evidenceId} style={{
                  display: "flex", alignItems: "center",
                  padding: "12px 20px", borderBottom: "1px solid #f9fafb", gap: 12,
                }}>
                  <div style={{
  width: 48,
  height: 48,
  borderRadius: 8,
  background: "#f3f4f6", // This background shows while loading
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  overflow: "hidden",
  border: "1px solid #e5e7eb" // Subtle border so you see the box immediately
}}>
  {isImage(f.uri) ? (
    <img
      src={getFileViewUrl(f.uri)}
      alt=""
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block" // Ensures no extra bottom spacing
      }}
      onLoad={(e) => e.target.style.opacity = 1} // Optional: fade in
      onError={e => { e.target.style.display = "none"; }}
    />
  ) : (
    <FileText size={20} style={{ color: "#3b82f6" }} />
  )}
</div>
 
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                        Evidence #{f.evidenceId}
                      </span>
                      <span className="adj-badge adj-badge-open" style={{ fontSize: 10 }}>{f.type}</span>
                    </div>
                    <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>
                      Uploaded: {f.uploadedDate} · {f.uri?.split(/[/\\]/).pop()}
                    </p>
                  </div>
 
                  <button onClick={() => handleView(f)} className="adj-evidence-view-btn">
                    {isImage(f.uri) ? <Image size={14} /> : <ExternalLink size={14} />}
                    {isImage(f.uri) ? "View" : "Open"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}