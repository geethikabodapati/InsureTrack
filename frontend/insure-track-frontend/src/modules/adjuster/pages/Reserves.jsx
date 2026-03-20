import { useState, useEffect } from "react";
import { DollarSign, AlertCircle, RefreshCw } from "lucide-react";
import { reservesApi, claimsApi } from "../../../core/services/api";

export function Reserves() {
  const [claims, setClaims] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reserves, setReserves] = useState([]);
  const [amount, setAmount] = useState("");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const showToast = (type, text) => { setToast({ type, text }); setTimeout(() => setToast(null), 3000); };

  // Load INVESTIGATING claims (reserves can only be created for these)
  // Also show SETTLED/CLOSED claims that already have reserves
  const loadClaims = async () => {
    setFetching(true);
    try {
      const res = await claimsApi.getAll();
      // Show all claims except OPEN/DENIED
      const relevant = (res.data || []).filter(c => ["INVESTIGATING", "SETTLED", "CLOSED"].includes(c.status));
      setClaims(relevant);
      if (relevant.length > 0) selectClaim(relevant[0]);
    } catch (err) {
      showToast("error", "Could not load claims: " + err.message);
    } finally { setFetching(false); }
  };

  const selectClaim = async (c) => {
    setSelected(c);
    setReserves([]);
    try {
      const res = await reservesApi.getByClaim(c.claimId);
      setReserves(Array.isArray(res.data) ? res.data : []);
    } catch (_) { }
  };

  useEffect(() => { loadClaims(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount)) return showToast("error", "Enter a valid amount.");
    setLoading(true);
    try {
      const res = await reservesApi.create(selected.claimId, { amount: parseFloat(amount) });
      setReserves(prev => [res.data, ...prev]);
      setAmount("");
      showToast("success", `Reserve #${res.data.reserveId} created · $${res.data.amount.toLocaleString()}`);
    } catch (err) { showToast("error", err.message); }
    finally { setLoading(false); }
  };

  const total = reserves.reduce((s, r) => s + (r.amount || 0), 0);

  const STATUS_BADGE = {
    INVESTIGATING: "bg-yellow-100 text-yellow-800",
    SETTLED: "bg-green-100 text-green-800",
    CLOSED: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reserve Management</h1>
          <p className="text-sm text-gray-500 mt-1">View and create reserves for claims</p>
        </div>
        <button onClick={loadClaims} disabled={fetching}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${fetching ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {toast && (
        <div className={`border rounded-lg p-4 mb-5 flex items-center gap-3 text-sm ${toast.type === "success" ? "bg-green-50 border-green-200 text-green-900" : "bg-red-50 border-red-200 text-red-900"
          }`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{toast.text}
        </div>
      )}

      {fetching ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-500 text-sm">Loading claims...</span>
        </div>
      ) : claims.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <DollarSign className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No claims available for reserves</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Claims list */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
              <p className="text-sm font-semibold text-gray-900">{claims.length} Claims</p>
            </div>
            <div className="divide-y divide-gray-50 max-h-[520px] overflow-y-auto">
              {claims.map(c => (
                <button key={c.claimId} onClick={() => selectClaim(c)}
                  className={`w-full text-left px-5 py-4 transition-colors ${selected?.claimId === c.claimId ? "bg-blue-50 border-l-4 border-l-blue-600" : "hover:bg-gray-50"
                    }`}>
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-bold text-gray-900">#{c.claimId}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[c.status] || "bg-gray-100 text-gray-700"}`}>{c.status}</span>
                  </div>
                  <p className="text-xs text-gray-500">{c.claimType}</p>
                  <p className="text-xs text-gray-400">Policy #{c.policyId}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Reserve details + create */}
          {selected && (
            <div className="lg:col-span-2 space-y-5">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">Claim</p>
                  <p className="text-lg font-bold text-blue-600">#{selected.claimId}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">Reserves</p>
                  <p className="text-lg font-bold text-gray-900">{reserves.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                  <p className="text-lg font-bold text-green-600">${total.toLocaleString()}</p>
                </div>
              </div>

              {/* Create form */}
              {selected.status === "INVESTIGATING" && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <p className="text-sm font-semibold text-gray-900 mb-3">Create Reserve for Claim #{selected.claimId}</p>
                  <form onSubmit={handleCreate} className="flex gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2.5 text-gray-400 text-sm">$</span>
                      <input required type="number" min="0" step="0.01" placeholder="e.g. 1500.00"
                        value={amount} onChange={e => setAmount(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <button type="submit" disabled={loading}
                      className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50">
                      <DollarSign className="w-4 h-4" /> {loading ? "Creating..." : "Create Reserve"}
                    </button>
                  </form>
                </div>
              )}

              {/* Reserves table */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">Reserves for Claim #{selected.claimId}</p>
                </div>
                {reserves.length === 0 ? (
                  <div className="py-10 text-center text-gray-400 text-sm">No reserves yet</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {["Reserve ID", "Amount", "Created Date", "Status"].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {reserves.map(r => (
                        <tr key={r.reserveId} className="hover:bg-gray-50">
                          <td className="px-5 py-3.5 font-semibold text-blue-600">#{r.reserveId}</td>
                          <td className="px-5 py-3.5 font-bold text-gray-900">${r.amount?.toLocaleString()}</td>
                          <td className="px-5 py-3.5 text-gray-600">{r.createdDate}</td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">{r.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
