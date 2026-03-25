import { useState } from "react";
import { RefreshCw, AlertCircle,Search } from "lucide-react";
import { claimsApi } from "../../../core/services/api";
import '../styles/adjuster.css';
 
const STEPS = [
  { status: "OPEN",          label: "OPEN",          desc: "Customer filed FNOL"        },
  { status: "INVESTIGATING", label: "INVESTIGATING",  desc: "Moved to review"            },
  { status: "SETTLED",       label: "SETTLED",        desc: "Adjuster approved"          },
  { status: "CLOSED",        label: "CLOSED",         desc: "Settlement paid"            },
];
 
function statusBadgeClass(status) {
  const map = { OPEN:"adj-badge adj-badge-open", INVESTIGATING:"adj-badge adj-badge-investigating", SETTLED:"adj-badge adj-badge-settled", DENIED:"adj-badge adj-badge-denied", CLOSED:"adj-badge adj-badge-closed" };
  return map[status] || "adj-badge adj-badge-closed";
}
 
export function Dashboard() {
  const [searchId, setSearchId] = useState("");
  const [claim,    setClaim]    = useState(null);
  const [fetching, setFetching] = useState(false);
  const [error,    setError]    = useState("");   // inline, no layout shift
 
  const fetchClaim = async () => {
    if (!searchId.trim()) return;
    setFetching(true); setClaim(null); setError("");
    try {
      const res = await claimsApi.getById(searchId.trim());
      setClaim(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "No claim found with that ID.");
    } finally { setFetching(false); }
  };
 
  const stepIndex = STEPS.findIndex(s => s.status === claim?.status);
 
  return (
    <div className="adj-page">
      <div className="adj-page-header">
        <div>
          <h1 className="adj-page-title">Welcome 👋</h1>
          <p className="adj-page-sub">Adjuster · InsureTrack</p>
        </div>
      </div>
 
      {/* Claim Lookup */}
      <div className="adj-card"style={{ marginBottom: 30, position: 'relative', minHeight: '130px' }}>
        <p className="adj-card-title">Look Up a Claim</p>
        <div className="adj-row">
          <input type="number" placeholder="Enter Claim ID"
            value={searchId}
            onChange={e => { setSearchId(e.target.value); setError(""); setClaim(null); }}
            onKeyDown={e => e.key === "Enter" && fetchClaim()}
            className="adj-input" style={{ flex: 1 }} />
          <button onClick={fetchClaim} disabled={fetching}
            className="adj-btn adj-btn-primary" style={{ flexShrink: 0 }}>
            {fetching ? (
    <RefreshCw size={14} className="adj-spin" />
  ) : (
    <Search size={14} />
  )}
          </button>
       
        </div>
        {/* Inline error — no layout shift, stays inside card */}
        {error && (
          <p className="adj-field-error" style={{ marginTop: 8 }}>
            <AlertCircle size={13} /> {error}
          </p>
        )}
      </div>
 
      {/* Claim Result — only appears when found */}
      {claim && (
        <div className="adj-card">
          <div className="adj-row-between" style={{ marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>Claim #{claim.claimId}</p>
              <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                {claim.claimType} · {claim.policyNumber || `Policy #${claim.policyId}`}
              </p>
            </div>
            <span className={statusBadgeClass(claim.status)}>{claim.status}</span>
          </div>
 
          {claim.status === "DENIED" ? (
            <div className="adj-denied-banner">✕ Claim DENIED</div>
          ) : (
            <div className="adj-flow-steps" style={{ marginBottom: 20 }}>
              {STEPS.map((step, i) => {
                const isActive = claim.status === step.status;
                const isPast   = stepIndex > i;
                return (
                  <div key={step.status} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                    <div className="adj-flow-step">
                      <div className={`adj-flow-circle ${isActive ? "active" : isPast ? "done" : "future"}`}>{i + 1}</div>
                      <p className={`adj-flow-label ${isActive ? "active" : "other"}`}>{step.label}</p>
                      <p className="adj-flow-desc">{step.desc}</p>
                    </div>
                    {i < STEPS.length - 1 && <div className={`adj-flow-connector ${isPast ? "done" : "future"}`} />}
                  </div>
                );
              })}
            </div>
          )}
 
          <div className="adj-data-grid-4">
            {[
              ["Incident Date", claim.incidentDate],
              ["Reported Date", claim.reportedDate],
              ["Claim Type",    claim.claimType],
              ["Policy",        claim.policyNumber || `#${claim.policyId}`],
            ].map(([k, v]) => (
              <div key={k} className="adj-data-item">
                <p className="adj-data-label">{k}</p>
                <p className="adj-data-value" style={{ fontSize: k === "Policy" ? 10 : 13, fontFamily: k === "Policy" ? "monospace" : "inherit" }}>{v}</p>
              </div>
            ))}
            <div className="adj-data-item" style={{ gridColumn: "1 / -1" }}>
              <p className="adj-data-label">Description</p>
              <p className="adj-data-value" style={{ fontWeight: 400 }}>{claim.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}