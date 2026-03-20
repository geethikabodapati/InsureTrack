// import { useState, useEffect } from "react";
// import { FileCheck, AlertCircle, RefreshCw, DollarSign } from "lucide-react";
// import { settlementApi, claimsApi } from "../../../services/api";
// import { useNotifications } from "./NotificationContext";

// export function Settlements() {
//   const [claims, setClaims]         = useState([]);
//   const [selected, setSelected]     = useState(null);
//   const [settlement, setSettlement] = useState(null);
//   const [amount, setAmount]         = useState("");
//   const [toast, setToast]           = useState(null);
//   const [loading, setLoading]       = useState(false);
//   const [fetching, setFetching]     = useState(false);
//   const { refresh }                 = useNotifications();

//   const showToast = (type, text) => { setToast({ type, text }); setTimeout(() => setToast(null), 5000); };

//   const loadClaims = async () => {
//     setFetching(true);
//     try {
//       const res = await claimsApi.getAll();
//       const relevant = (res.data || []).filter(c => ["SETTLED","CLOSED"].includes(c.status));
//       setClaims(relevant);
//       if (relevant.length > 0) selectClaim(relevant[0]);
//     } catch (err) {
//       showToast("error", "Could not load claims: " + err.message);
//     } finally { setFetching(false); }
//   };

//   const selectClaim = async (c) => {
//     setSelected(c);
//     setSettlement(null);
//     try {
//       const res = await settlementApi.getByClaim(c.claimId);
//       setSettlement(res.data);
//     } catch (_) {}
//   };

//   useEffect(() => { loadClaims(); }, []);

//   const handleSettle = async () => {
//     if (!amount || isNaN(amount)) return showToast("error", "Enter a valid amount.");
//     setLoading(true);
//     try {
//       const res = await settlementApi.create(selected.claimId, {
//         settlementAmount: parseFloat(amount),
//       });
//       setSettlement(res.data);
//       setAmount("");
//       // ── Fire notification ──
//       refresh();
//       showToast("success",
//         `Settlement #${res.data.settlementId} · $${res.data.settlementAmount.toLocaleString()} · ${res.data.status}`);
//       loadClaims();
//     } catch (err) { showToast("error", err.message); }
//     finally { setLoading(false); }
//   };

//   const STATUS_BADGE = {
//     SETTLED: "bg-green-100 text-green-800",
//     CLOSED:  "bg-gray-100 text-gray-700",
//     PAID:    "bg-green-100 text-green-800",
//   };

//   return (
//     <div className="max-w-7xl mx-auto">
//       <div className="mb-5 flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-semibold text-gray-900">Settlement Management</h1>
//           <p className="text-sm text-gray-500 mt-1">Process payments for approved (SETTLED) claims</p>
//         </div>
//         <button onClick={loadClaims} disabled={fetching}
//           className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium disabled:opacity-50">
//           <RefreshCw className={`w-4 h-4 ${fetching ? "animate-spin" : ""}`} /> Refresh
//         </button>
//       </div>

//       {toast && (
//         <div className={`border rounded-lg p-4 mb-5 flex items-center gap-3 text-sm ${
//           toast.type === "success" ? "bg-green-50 border-green-200 text-green-900" : "bg-red-50 border-red-200 text-red-900"
//         }`}>
//           <AlertCircle className="w-4 h-4 flex-shrink-0" />{toast.text}
//         </div>
//       )}

//       {fetching ? (
//         <div className="flex items-center justify-center py-20">
//           <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
//           <span className="ml-3 text-gray-500 text-sm">Loading claims...</span>
//         </div>
//       ) : claims.length === 0 ? (
//         <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
//           <FileCheck className="w-12 h-12 text-gray-200 mx-auto mb-3" />
//           <p className="text-gray-500 text-sm font-medium">No approved claims yet</p>
//           <p className="text-gray-400 text-xs mt-1">Claims appear here after being approved in Investigation</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
//           {/* Claims list */}
//           <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//             <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
//               <p className="text-sm font-semibold text-gray-900">{claims.length} Claim{claims.length !== 1 ? "s" : ""}</p>
//             </div>
//             <div className="divide-y divide-gray-50 max-h-[520px] overflow-y-auto">
//               {claims.map(c => (
//                 <button key={c.claimId} onClick={() => selectClaim(c)}
//                   className={`w-full text-left px-5 py-4 transition-colors ${
//                     selected?.claimId === c.claimId ? "bg-blue-50 border-l-4 border-l-blue-600" : "hover:bg-gray-50"
//                   }`}>
//                   <div className="flex justify-between items-start mb-1">
//                     <p className="text-sm font-bold text-gray-900">#{c.claimId}</p>
//                     <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[c.status] || "bg-gray-100 text-gray-700"}`}>{c.status}</span>
//                   </div>
//                   <p className="text-xs text-gray-500">{c.claimType}</p>
//                   <p className="text-xs text-gray-400">Policy #{c.policyId}</p>
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Settlement panel */}
//           {selected && (
//             <div className="lg:col-span-2 space-y-5">
//               {/* Claim info */}
//               <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
//                 <div className="flex items-center justify-between mb-3">
//                   <p className="text-sm font-semibold text-gray-900">Claim #{selected.claimId}</p>
//                   <span className={`text-sm font-bold px-3 py-1 rounded-full ${STATUS_BADGE[selected.status] || "bg-gray-100 text-gray-700"}`}>{selected.status}</span>
//                 </div>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
//                   <div><p className="text-xs text-gray-500">Policy</p><p className="font-medium">#{selected.policyId}</p></div>
//                   <div><p className="text-xs text-gray-500">Type</p><p className="font-medium">{selected.claimType}</p></div>
//                   <div><p className="text-xs text-gray-500">Incident</p><p className="font-medium">{selected.incidentDate}</p></div>
//                   <div><p className="text-xs text-gray-500">Reported</p><p className="font-medium">{selected.reportedDate}</p></div>
//                 </div>
//               </div>

//               {/* Existing settlement */}
//               {settlement && (
//                 <div className="bg-green-50 border border-green-200 rounded-xl p-5">
//                   <div className="flex items-center gap-2 mb-3">
//                     <FileCheck className="w-5 h-5 text-green-600" />
//                     <p className="text-sm font-semibold text-green-900">Settlement Processed</p>
//                   </div>
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//                     <div><p className="text-xs text-green-700">Settlement ID</p><p className="text-sm font-bold text-green-900">#{settlement.settlementId}</p></div>
//                     <div><p className="text-xs text-green-700">Amount</p><p className="text-xl font-bold text-green-900">${settlement.settlementAmount?.toLocaleString()}</p></div>
//                     <div><p className="text-xs text-green-700">Date</p><p className="text-sm text-green-900">{settlement.settlementDate}</p></div>
//                     <div><p className="text-xs text-green-700">Status</p>
//                       <span className="inline-flex text-xs font-bold px-2.5 py-0.5 bg-green-100 text-green-800 rounded-full">{settlement.status}</span>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Process form */}
//               {!settlement && selected.status === "SETTLED" && (
//                 <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
//                   <div className="flex items-center gap-2 mb-2">
//                     <DollarSign className="w-5 h-5 text-green-600" />
//                     <p className="text-sm font-semibold text-gray-900">Process Settlement</p>
//                   </div>
//                   <p className="text-xs text-gray-500 mb-4">
//                     Enter amount · body: <code className="bg-gray-100 px-1.5 py-0.5 rounded">{"{ \"settlementAmount\": 1500.00 }"}</code>
//                     · Claim moves to <strong>CLOSED</strong> after payment.
//                   </p>
//                   <div className="flex gap-3">
//                     <div className="relative flex-1">
//                       <span className="absolute left-3 top-2.5 text-gray-400 text-sm">$</span>
//                       <input type="number" min="0" step="0.01" placeholder="e.g. 1500.00"
//                         value={amount} onChange={e => setAmount(e.target.value)}
//                         className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
//                     </div>
//                     <button onClick={handleSettle} disabled={loading}
//                       className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50">
//                       <FileCheck className="w-4 h-4" />
//                       {loading ? "Processing..." : "Process Settlement"}
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {!settlement && selected.status !== "SETTLED" && (
//                 <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
//                   <p className="text-sm text-orange-800">
//                     Settlement requires status <strong>SETTLED</strong>. Current: <strong>{selected.status}</strong>
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
import React, { useState, useEffect } from "react";
import { FileCheck, AlertCircle, RefreshCw, DollarSign } from "lucide-react";
import { settlementApi, claimsApi, reservesApi } from "../../../services/api";
import { useNotifications } from "./NotificationContext";

// Flow: SETTLED claim → MUST have reserves → enter amount → CLOSED
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

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 6000);
  };

  const loadClaims = async () => {
    setFetching(true);
    try {
      const res = await claimsApi.getAll();
      const relevant = (res.data || []).filter((c) =>
        ["SETTLED", "CLOSED"].includes(c.status)
      );
      setClaims(relevant);
      if (relevant.length > 0) selectClaim(relevant[0]);
      else {
        setSelected(null);
        setSettlement(null);
        setReserves([]);
      }
    } catch (err) {
      showToast("error", "Could not load claims: " + err.message);
    } finally {
      setFetching(false);
    }
  };

  const selectClaim = async (c) => {
    setSelected(c);
    setSettlement(null);
    setReserves([]);
    try {
      const [sRes, rRes] = await Promise.all([
        settlementApi.getByClaim(c.claimId).catch(() => ({ data: null })),
        reservesApi.getByClaim(c.claimId).catch(() => ({ data: [] })),
      ]);
      setSettlement(sRes.data || null);
      setReserves(Array.isArray(rRes.data) ? rRes.data : []);
    } catch (_) {}
  };

  useEffect(() => {
    loadClaims();
  }, []);

  const handleSettle = async () => {
    if (reserves.length === 0) {
      showToast(
        "error",
        "⚠ You must create a Reserve in the Reserves page before processing settlement."
      );
      return;
    }
    if (!amount || isNaN(amount))
      return showToast("error", "Enter a valid settlement amount.");
    setLoading(true);
    try {
      const res = await settlementApi.create(selected.claimId, {
        settlementAmount: parseFloat(amount),
      });
      setSettlement(res.data);
      setAmount("");
      refresh();
      showToast(
        "success",
        `Settlement #${res.data.settlementId} processed successfully. Claim is now CLOSED.`
      );
      loadClaims();
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const STATUS_BADGE = {
    SETTLED: "bg-green-100 text-green-800",
    CLOSED: "bg-gray-100 text-gray-700",
    PAID: "bg-green-100 text-green-800",
  };

  const totalReserved = reserves.reduce((s, r) => s + (r.amount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Settlement Management</h1>
          <p className="text-sm text-gray-500 mt-1">Process payments for approved claims</p>
        </div>
        <button
          onClick={loadClaims}
          disabled={fetching}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${fetching ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {toast && (
        <div
          className={`border rounded-lg p-4 mb-5 flex items-center gap-3 text-sm ${
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {toast.text}
        </div>
      )}

      {fetching ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-500 text-sm">Loading claims...</span>
        </div>
      ) : claims.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <FileCheck className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">No approved claims yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Claims list */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
              <p className="text-sm font-semibold text-gray-900">{claims.length} Claims</p>
            </div>
            <div className="divide-y divide-gray-50 max-h-[520px] overflow-y-auto">
              {claims.map((c) => (
                <button
                  key={c.claimId}
                  onClick={() => selectClaim(c)}
                  className={`w-full text-left px-5 py-4 transition-colors ${
                    selected?.claimId === c.claimId
                      ? "bg-blue-50 border-l-4 border-l-blue-600"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-bold text-gray-900">#{c.claimId}</p>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        STATUS_BADGE[c.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{c.claimType}</p>
                  <p className="text-xs text-gray-400">Policy #{c.policyId}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Settlement panel */}
          {selected && (
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-900">Claim Details</p>
                  <span
                    className={`text-sm font-bold px-3 py-1 rounded-full ${
                      STATUS_BADGE[selected.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {selected.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div><p className="text-xs text-gray-500">Policy</p><p className="font-medium">#{selected.policyId}</p></div>
                  <div><p className="text-xs text-gray-500">Type</p><p className="font-medium">{selected.claimType}</p></div>
                  <div><p className="text-xs text-gray-500">Incident</p><p className="font-medium">{selected.incidentDate}</p></div>
                  <div><p className="text-xs text-gray-500">Reported</p><p className="font-medium">{selected.reportedDate}</p></div>
                </div>
              </div>

              {/* Reserve check */}
              <div className={`rounded-xl border p-4 ${reserves.length > 0 ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className={`w-4 h-4 ${reserves.length > 0 ? "text-green-600" : "text-orange-600"}`} />
                    <div>
                      <p className="text-sm font-semibold">{reserves.length > 0 ? "✓ Reserve Created" : "⚠ No Reserve Found"}</p>
                      <p className="text-xs mt-0.5">Total Reserved: <strong>${totalReserved.toLocaleString()}</strong></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Settlement Data / Form */}
              {settlement ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <FileCheck className="w-5 h-5 text-green-600" />
                    <p className="text-sm font-semibold text-green-900">Settlement Processed</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div><p className="text-xs text-green-700">Settlement ID</p><p className="text-sm font-bold">#{settlement.settlementId}</p></div>
                    <div><p className="text-xs text-green-700">Amount</p><p className="text-xl font-bold">${settlement.settlementAmount?.toLocaleString()}</p></div>
                    <div><p className="text-xs text-green-700">Date</p><p className="text-sm">{settlement.settlementDate}</p></div>
                    <div><p className="text-xs text-green-700">Status</p><span className="text-xs font-bold px-2 py-0.5 bg-green-100 rounded-full">PAID</span></div>
                  </div>
                </div>
              ) : selected.status === "SETTLED" && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <p className="text-sm font-semibold mb-4">Process Settlement Payment</p>
                  {reserves.length === 0 ? (
                    <p className="text-xs text-red-600">⚠ Cannot process settlement — no reserve exists.</p>
                  ) : (
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-2.5 text-gray-400 text-sm">$</span>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder={`e.g. ${totalReserved}`}
                          className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <button
                        onClick={handleSettle}
                        disabled={loading}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50"
                      >
                        {loading ? "Processing..." : "Process & Close"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}