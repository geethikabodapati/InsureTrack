import { useState, useEffect, useCallback, useMemo } from "react";
import { DollarSign, AlertCircle, RefreshCw, Info } from "lucide-react";
import { reservesApi, claimsApi } from "../../../core/services/api";
import '../styles/adjuster.css';
 
function badgeClass(s) {
  const m = {
    OPEN: "adj-badge adj-badge-open",
    ADJUSTED: "adj-badge adj-badge-investigating",
    RELEASED: "adj-badge adj-badge-settled",
  };
  return m[s] || "adj-badge adj-badge-open";
}
 
export function Reserves() {
  const [claims, setClaims] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reserves, setReserves] = useState([]);
  const [amount, setAmount] = useState("");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [policyInfo, setPolicyInfo] = useState(null);
 
  const showToast = (type, text) => { setToast({ type, text }); setTimeout(() => setToast(null), 4000); };
 
  const stats = useMemo(() => {
    const policyAmount = policyInfo?.premium ? parseFloat(policyInfo.premium) : 0;
    const totalReserved = reserves.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
    console.log(reserves.amount);
    const totalPaid = reserves.filter(r => r.status === "RELEASED").reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
    const totalPending = reserves.filter(r => r.status === "OPEN" || r.status === "ADJUSTED").reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
    return { totalReserved, totalPaid, totalPending, policyAmount, remaining: policyAmount - totalPaid };
  }, [reserves, policyInfo]);
 
  const selectClaim = useCallback(async (c) => {
    if (!c) {
      setSelected(null);
      setReserves([]);
      setPolicyInfo(null);
      return;
    }
    setSelected(c);
    setFetching(true);
    try {
      const [resResponse, policyResponse] = await Promise.all([
        reservesApi.getByPolicy(c.policyId),
        claimsApi.getPolicyInfo(c.policyId)
      ]);
      setReserves(Array.isArray(resResponse.data) ? resResponse.data : []);
      setPolicyInfo(policyResponse.data);
    } catch (err) { console.error(err); }
    finally { setFetching(false); }
  }, []);
 
  const loadClaims = useCallback(async () => {
    setFetching(true);
    try {
      const res = await claimsApi.getAll();
      // Only keep ADJUDICATED claims in this view
      const rel = (res.data || []).filter(c => c.status === "ADJUDICATED");
      setClaims(rel);
     
      // If the currently selected claim is no longer in the ADJUDICATED list,
      // or if we are loading for the first time, select the first available
      if (rel.length > 0) {
        await selectClaim(rel[0]);
      } else {
        setSelected(null);
        setPolicyInfo(null);
        setReserves([]);
      }
    } catch (err) { showToast("error", "Error loading claims"); }
    finally { setFetching(false); }
  }, [selectClaim]);
 
  useEffect(() => { loadClaims(); }, [loadClaims]);
 
  const handleCreate = async (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!amount || isNaN(val) || val <= 0) return showToast("error", "Enter valid amount");
    if (val > stats.remaining) return showToast("error", "Exceeds balance");
   
    setLoading(true);
    try {
      await reservesApi.create(selected.claimId, { amount: val });
      showToast("success", "Reserve Created. Claim moved to SETTLED.");
      setAmount("");
      // This will refetch and filter out the now SETTLED claim
      await loadClaims();
    } catch (err) { showToast("error", err.message); }
    finally { setLoading(false); }
  };
 
 return (
  <div className="adj-page">
    <div className="adj-page-header">
      <div>
        <h1 className="adj-page-title">Reserve Management</h1>
        <p className="adj-page-sub">
          {selected ? `Policy: ${policyInfo?.policyNumber}` : "Financial oversight for adjudicated claims"}
        </p>
      </div>
      <button onClick={loadClaims} disabled={fetching} className="adj-refresh-btn">
        <RefreshCw size={14} className={fetching ? "adj-spin" : ""} /> Refresh
      </button>
    </div>
 
    {toast && (
      <div className={`adj-toast ${toast.type === "success" ? "adj-toast-success" : "adj-toast-error"}`}>
        <AlertCircle size={16} /> <span>{toast.text}</span>
      </div>
    )}
 
    {/* Flexbox container ensures columns stretch together */}
    <div className="adj-split" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px', alignItems: 'stretch' }}>
     
      {/* LEFT SIDEBAR PANEL */}
      <div className="adj-list-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="adj-list-panel-header">
          {claims.length} Claims to Reserve
        </div>
       
        <div className="adj-list-scroll" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {claims.length > 0 ? (
            claims.map(c => (
              <button
                key={c.claimId}
                onClick={() => selectClaim(c)}
                className={`adj-list-item ${selected?.claimId === c.claimId ? "selected" : ""}`}
              >
                <div className="adj-list-item-top">
                  <span className="adj-list-item-id">#{c.claimId}</span>
                  <span className={badgeClass(c.status)}>{c.status}</span>
                </div>
                <p className="adj-list-item-type">{c.claimType}</p>
                <p className="adj-list-item-meta">{c.policyNumber || `#${c.policyId}`}</p>
              </button>
            ))
          ) : (
            /* MATCHING HEIGHT BOX FOR LEFT SIDE */
            <div className="adj-empty-sub" style={{
              height: '120px', // Smaller, compact height
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              fontSize: '13px'
            }}>
              No claims waiting
            </div>
          )}
        </div>
      </div>
 
      {/* RIGHT DETAIL COLUMN */}
      <div className="adj-detail-col" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {selected ? (
          <>
            {/* Summary Cards */}
            <div className="adj-reserve-summary" style={{ display: 'grid', gridTemplateColumns: "repeat(5, 1fr)", gap: '10px' }}>
              <div className="adj-reserve-summary-card"><p className="adj-reserve-summary-label">Policy</p><p className="adj-reserve-summary-value">${stats.policyAmount.toLocaleString()}</p></div>
              <div className="adj-reserve-summary-card"><p className="adj-reserve-summary-label">Total Res</p><p className="adj-reserve-summary-value" style={{ color: "#3b82f6" }}>${stats.totalReserved.toLocaleString()}</p></div>
              <div className="adj-reserve-summary-card"><p className="adj-reserve-summary-label">Paid</p><p className="adj-reserve-summary-value" style={{ color: "#16a34a" }}>${stats.totalPaid.toLocaleString()}</p></div>
              <div className="adj-reserve-summary-card"><p className="adj-reserve-summary-label">Pending</p><p className="adj-reserve-summary-value" style={{ color: "#ca8a04" }}>${stats.totalPending.toLocaleString()}</p></div>
              <div className="adj-reserve-summary-card"><p className="adj-reserve-summary-label">Balance</p><p className="adj-reserve-summary-value" style={{ color: stats.remaining < 500 ? "#dc2626" : "#16a34a" }}>${stats.remaining.toLocaleString()}</p></div>
            </div>
 
            {/* Form */}
            <div className="adj-card">
              <p className="adj-card-title">Open Reserve for Claim #{selected.claimId}</p>
              <form onSubmit={handleCreate} className="adj-row">
                <div className="adj-input-dollar" style={{ flex: 1 }}>
                  <span className="adj-input-dollar-sign">$</span>
                  <input required type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="adj-input" />
                </div>
                <button type="submit" disabled={loading} className="adj-btn adj-btn-success">
                  {loading ? "..." : "Open Reserve"}
                </button>
              </form>
            </div>
 
            {/* Table */}
            <div className="adj-table-wrap">
              <div className="adj-table-header">Policy Transaction History</div>
              <table className="adj-table">
                <thead><tr><th>Res ID</th><th>Claim</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  {reserves.map(r => (
                    <tr key={r.reserveId}>
                      <td className="adj-table-id">#{r.reserveId}</td>
                      <td style={{ fontSize: '11px' }}>Claim #{r.claimId}</td>
                      <td style={{ fontWeight: 700 }}>${r.amount?.toLocaleString()}</td>
                      <td><span className={badgeClass(r.status)}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          /* MATCHING HEIGHT BOX FOR RIGHT SIDE */
          <div className="adj-empty" style={{
            margin: 0,
            padding: '40px 20px', // Reduced padding from 60px to 40px
            height: '220px',      // Fixed height to match the sidebar exactly
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div className="adj-empty-icon">
              <DollarSign size={48} />
            </div>
            <p className="adj-empty-title">No pending adjudications</p>
            <p className="adj-empty-sub">Approved claims will appear here for financial backing.</p>
          </div>
        )}
      </div>
    </div>
  </div>
);
}