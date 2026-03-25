import { useState, useEffect } from "react";
import { RefreshCw, AlertCircle, Search } from "lucide-react";
import { claimsApi } from "../../../core/services/api";
import '../styles/adjuster.css';
 
const STATUSES = ["ALL","OPEN","INVESTIGATING","SETTLED","DENIED","CLOSED"];
 
function badgeClass(s) {
  const m = {
    OPEN:          "adj-badge adj-badge-open",
    INVESTIGATING: "adj-badge adj-badge-investigating",
    SETTLED:       "adj-badge adj-badge-settled",
    DENIED:        "adj-badge adj-badge-denied",
    CLOSED:        "adj-badge adj-badge-closed",
  };
  return m[s] || "adj-badge adj-badge-closed";
}
 
export function MyClaims() {
  const [claims,   setClaims]   = useState([]);
  const [filter,   setFilter]   = useState("ALL");
  const [search,   setSearch]   = useState("");
  const [fetching, setFetching] = useState(false);
  const [toast,    setToast]    = useState(null);
 
  const showToast = (type, text) => { setToast({ type, text }); setTimeout(() => setToast(null), 3000); };
 
  const loadClaims = async () => {
    setFetching(true);
    try {
      const res = await claimsApi.getAll();
      setClaims(res.data || []);
    } catch (err) {
      showToast("error", "Could not load claims: " + err.message);
    } finally {
      setFetching(false);
    }
  };
 
  useEffect(() => { loadClaims(); }, []);
 
  const filtered = claims
    .filter(c => filter === "ALL" || c.status === filter)
    .filter(c => {
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return (
        String(c.claimId).includes(s) ||
        (c.policyNumber || "").toLowerCase().includes(s) ||
        (c.claimType || "").toLowerCase().includes(s) ||
        (c.description || "").toLowerCase().includes(s)
      );
    });
 
  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = s === "ALL" ? claims.length : claims.filter(c => c.status === s).length;
    return acc;
  }, {});
 
  return (
    <div className="adj-page">
      <div className="adj-page-header">
        <div>
          <h1 className="adj-page-title">Claims</h1>
          {/* <p className="adj-page-sub">All claims in the system</p> */}
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
 
      <div className="adj-filter-bar">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`adj-filter-btn ${filter === s ? "active" : ""}`}>
            {s}<span className="adj-filter-count">({counts[s]})</span>
          </button>
        ))}
      </div>
 
      <div className="adj-search-wrap">
        <Search size={16} className="adj-search-icon" />
        <input type="text"
          placeholder="Search by Claim ID, policy number, type, description..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="adj-search-input" />
      </div>
 
      {fetching ? (
        <div className="adj-loading">
          <RefreshCw size={24} className="adj-spin" /><span>Loading claims...</span>
        </div>
      ) : (
        <div className="adj-table-wrap">
          <div className="adj-table-header">
            {filtered.length} claim{filtered.length !== 1 ? "s" : ""}
            {filter !== "ALL" && ` · ${filter}`}
            {search && ` · matching "${search}"`}
          </div>
          {filtered.length === 0 ? (
            <div className="adj-table-empty">No claims found</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="adj-table">
                <thead>
                  <tr>
                    {/* Policy Number header instead of Policy ID */}
                    {["Claim ID", "Policy Number", "Type", "Incident Date", "Reported Date", "Status"].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.claimId}>
                      <td className="adj-table-id">#{c.claimId}</td>
                      {/* Policy number from backend */}
                      <td style={{ fontSize: 11, color: "#6b7280", fontFamily: "monospace" }}>
                        {c.policyNumber || `#${c.policyId}`}
                      </td>
                      <td>{c.claimType}</td>
                      <td style={{ color: "#6b7280" }}>{c.incidentDate}</td>
                      <td style={{ color: "#6b7280" }}>{c.reportedDate}</td>
                      <td><span className={badgeClass(c.status)}>{c.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}