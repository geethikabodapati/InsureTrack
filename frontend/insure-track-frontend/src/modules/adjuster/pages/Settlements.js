import { useState, useEffect } from "react";
import { FileCheck, AlertCircle, RefreshCw, DollarSign } from "lucide-react";
import { settlementApi, claimsApi, reservesApi } from "../../../core/services/api";
import { useNotifications } from "./NotificationContext";
import '../styles/adjuster.css';
 
function badgeClass(s) {
  const m = {
    PENDING: "adj-badge adj-badge-investigating",
    PAID: "adj-badge adj-badge-settled",
    FAILED: "adj-badge adj-badge-denied",
    SETTLED: "adj-badge adj-badge-open", // Claim is ready for payout
  };
  return m[s] || "adj-badge adj-badge-closed";
}
 
export function Settlements() {
  const [claims, setClaims] = useState([]);
  const [selected, setSelected] = useState(null);
  const [settlement, setSettlement] = useState(null);
  const [reserves, setReserves] = useState([]);
  const [amount, setAmount] = useState("");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const { refresh } = useNotifications();
 
  const showToast = (type, text) => { setToast({ type, text }); setTimeout(() => setToast(null), 5000); };
 
  const loadClaims = async () => {
  setFetching(true);
  try {
    // 1. Simultaneous ga Claims and Settlements fetch cheyali
    const [claimsRes, settlementsRes] = await Promise.all([
      claimsApi.getAll(),
      settlementApi.getAll() // Backend lo getAllSettlements endpoint undali
    ]);
 
    const allClaims = claimsRes.data || [];
    const allSettlements = settlementsRes.data || [];
 
    // 2. Already settlement create ayina Claim IDs ni oka Set lo pettuko
    const processedClaimIds = new Set(allSettlements.map(s => s.claimId));
 
    // 3. Filter Logic:
    // - Status "SETTLED" undali
    // - Status "CLOSED" undakudadhu
    // - Settlements table lo entry undakudadhu (Ante inka settle avvalsindi ani)
    const finalRel = allClaims.filter(c =>
      c.status === "SETTLED" &&
      c.status !== "CLOSED" &&
      !processedClaimIds.has(c.claimId)
    );
 
    setClaims(finalRel);
   
    if (finalRel.length > 0) {
      selectClaim(finalRel[0]);
    } else {
      setEmptyState();
    }
 
  } catch (err) {
    console.error("Load Error:", err);
    showToast("error", "Error loading claims or settlements");
  } finally {
    setFetching(false);
  }
};
const setEmptyState = () => {
  setSelected(null);
  setSettlement(null);
  setReserves([]);
};
  const selectClaim = async (c) => {
    if (!c) return;
    setSelected(c);
    setSettlement(null);
    setReserves([]);
    try {
      const [sRes, rRes] = await Promise.all([
        settlementApi.getByClaim(c.claimId).catch(() => ({ data: null })),
        reservesApi.getByPolicy(c.policyId),
      ]);
      setSettlement(sRes.data || null);
      setReserves(Array.isArray(rRes.data) ? rRes.data : []);
    } catch (_) {}
  };
 
  useEffect(() => { loadClaims(); }, []);
 
  const handleSettle = async () => {
    if (!selected) return;
    const currentReserve = reserves.find(r => r.claimId === selected.claimId);
    if (!currentReserve) return showToast("error", "⚠ No reserve allocated for this claim.");
   
    setLoading(true);
    try {
      const res = await settlementApi.create(selected.claimId, { settlementAmount: parseFloat(amount) });
     
      refresh();
      showToast("success", "Settlement PENDING. Claim moved to pay queue.");
     
      // LOGIC: Remove from the sidebar list immediately (The "Vanish" Logic)
      const updatedClaims = claims.filter(c => c.claimId !== selected.claimId);
      setClaims(updatedClaims);
     
      if (updatedClaims.length > 0) {
        selectClaim(updatedClaims[0]);
      } else {
        setSelected(null);
        setSettlement(null);
      }
     
      setAmount("");
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setLoading(false);
    }
  };
 
  const currentClaimReserves = reserves.filter(r => r.claimId === selected?.claimId).reduce((s, r) => s + (r.amount || 0), 0);
 
  return (
    <div className="adj-page">
      <div className="adj-page-header">
        <div>
          <h1 className="adj-page-title">Settlement Management</h1>
          <p className="adj-page-sub">Process payments for finalized claims</p>
        </div>
        <button onClick={loadClaims} disabled={fetching} className="adj-refresh-btn">
          <RefreshCw size={14} strokeWidth={2} className={fetching ? "adj-spin" : ""} /> Refresh
        </button>
      </div>
 
      {toast && (
        <div className={`adj-toast ${toast.type === "success" ? "adj-toast-success" : "adj-toast-error"}`}>
          <AlertCircle size={16} /> <span>{toast.text}</span>
        </div>
      )}
 
      <div className="adj-split" style={{ alignItems: 'start' }}>
        {/* LEFT PANEL */}
        <div className="adj-list-panel">
          <div className="adj-list-panel-header">{claims.length} Ready for Payment</div>
          <div className="adj-list-scroll">
            {claims.length > 0 ? (
              claims.map(c => (
                <button key={c.claimId} onClick={() => selectClaim(c)}
                  className={`adj-list-item ${selected?.claimId === c.claimId ? "selected" : ""}`}>
                  <div className="adj-list-item-top">
                    <span className="adj-list-item-id">#{c.claimId}</span>
                    <span className={badgeClass(c.status)} style={{fontSize: 9}}>{c.status}</span>
                  </div>
                  <p className="adj-list-item-type">{c.claimType}</p>
                  <p className="adj-list-item-meta">{c.policyNumber || `#${c.policyId}`}</p>
                </button>
              ))
            ) : (
              <div className="adj-empty-sub" style={{ height: '170px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                No claims ready
              </div>
            )}
          </div>
        </div>
 
        {/* RIGHT PANEL */}
        <div className="adj-detail-col">
          {selected ? (
            <>
              <div className="adj-card">
                <div className="adj-card-header">
                  <p className="adj-card-title">Payout Verification</p>
                  <span className={badgeClass(selected.status)}>{selected.status}</span>
                </div>
                <div className="adj-data-grid-4">
                  {[["Policy", selected.policyNumber || `#${selected.policyId}`], ["Type", selected.claimType], ["Incident", selected.incidentDate], ["Reported", selected.reportedDate]].map(([k, v]) => (
                    <div key={k} className="adj-data-item">
                      <p className="adj-data-label">{k}</p>
                      <p className="adj-data-value" style={{ fontSize: 11 }}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>
 
              <div className={`adj-reserve-banner ${currentClaimReserves > 0 ? "has-reserve" : "no-reserve"}`}>
                <DollarSign size={16} style={{ color: currentClaimReserves > 0 ? "#16a34a" : "#ea580c" }} />
                <div>
                  <p className="adj-reserve-banner-title">{currentClaimReserves > 0 ? "✓ Reserve Allocated" : "⚠ No Reserve Found"}</p>
                  <p className="adj-reserve-banner-sub">Claim limit for settlement: <strong>₹{(currentClaimReserves || 0).toLocaleString()}</strong></p>
                </div>
              </div>
 
              <div className="adj-card">
                <p className="adj-card-title">Initiate Settlement</p>
                <div style={{ display: "flex", gap: 12 }}>
                  <div className="adj-input-dollar" style={{ flex: 1 }}>
                    <span className="adj-input-dollar-sign">$</span>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                      placeholder={currentClaimReserves > 0 ? currentClaimReserves : "0.00"} className="adj-input" />
                  </div>
                  <button onClick={handleSettle} disabled={loading || currentClaimReserves === 0} className="adj-btn adj-btn-success">
                    {loading ? "..." : "Create Settlement"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* COMPACT EMPTY STATE TO MATCH SIDEBAR */
            <div className="adj-empty" style={{ margin: 0, height: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="adj-empty-icon">
                <FileCheck size={48} strokeWidth={1.5} />
              </div>
              <p className="adj-empty-title">No approved claims</p>
              <p className="adj-empty-sub">Settlements will appear here once reserves are opened.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}