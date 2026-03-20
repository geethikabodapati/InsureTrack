// import { useState, useEffect } from "react";
// import { FileText, DollarSign, CheckCircle, XCircle, RefreshCw, AlertCircle } from "lucide-react";
// import { claimsApi, evidenceApi, reservesApi } from "../../../services/api";
// import { useNotifications } from "./NotificationContext";

// const STATUS_BADGE = {
//   OPEN:          "bg-blue-100 text-blue-800",
//   INVESTIGATING: "bg-yellow-100 text-yellow-800",
//   SETTLED:       "bg-green-100 text-green-800",
//   DENIED:        "bg-red-100 text-red-800",
//   CLOSED:        "bg-gray-100 text-gray-700",
// };

// const CHECKLIST = [
//   "Review claim details","Verify policy coverage","Review submitted evidence",
//   "Interview claimant","Assess damage","Determine liability","Calculate reserve",
// ];

// export function Investigation() {
//   const [claims, setClaims]       = useState([]);
//   const [selected, setSelected]   = useState(null);
//   const [evidence, setEvidence]   = useState([]);
//   const [reserves, setReserves]   = useState([]);
//   const [reserveAmt, setReserveAmt] = useState("");
//   const [notes, setNotes]         = useState([]);
//   const [noteInput, setNoteInput] = useState("");
//   const [checked, setChecked]     = useState({});
//   const [toast, setToast]         = useState(null);
//   const [loading, setLoading]     = useState(false);
//   const [fetching, setFetching]   = useState(false);
//   const { refresh }               = useNotifications();

//   const showToast = (type, text) => { setToast({ type, text }); setTimeout(() => setToast(null), 5000); };

//   const loadClaims = async () => {
//     setFetching(true);
//     try {
//       const res = await claimsApi.getByStatus("INVESTIGATING");
//       setClaims(res.data || []);
//       if (res.data?.length > 0) selectClaim(res.data[0]);
//     } catch (err) {
//       showToast("error", "Could not load claims: " + err.message);
//     } finally { setFetching(false); }
//   };

//   const selectClaim = async (c) => {
//     setSelected(c);
//     setEvidence([]); setReserves([]);
//     try {
//       const [eRes, rRes] = await Promise.all([
//         evidenceApi.getByClaim(c.claimId).catch(() => ({ data: [] })),
//         reservesApi.getByClaim(c.claimId).catch(() => ({ data: [] })),
//       ]);
//       setEvidence(Array.isArray(eRes.data) ? eRes.data : []);
//       setReserves(Array.isArray(rRes.data) ? rRes.data : []);
//     } catch (_) {}
//   };

//   useEffect(() => { loadClaims(); }, []);

//   const handleCreateReserve = async () => {
//     if (!reserveAmt || isNaN(reserveAmt)) return showToast("error", "Enter a valid amount.");
//     setLoading(true);
//     try {
//       const res = await reservesApi.create(selected.claimId, { amount: parseFloat(reserveAmt) });
//       setReserves(prev => [res.data, ...prev]);
//       setReserveAmt("");
//       showToast("success", `Reserve #${res.data.reserveId} · $${res.data.amount.toLocaleString()} · ${res.data.status}`);
//     } catch (err) { showToast("error", err.message); }
//     finally { setLoading(false); }
//   };

//   const handleApprove = async () => {
//     setLoading(true);
//     try {
//       const res = await claimsApi.approve(selected.claimId);
//       // ── Fire notification ──
//       refresh();
//       showToast("success", `Claim #${res.data.claimId} → ${res.data.status}. Go to Settlements.`);
//       const updated = claims.filter(c => c.claimId !== selected.claimId);
//       setClaims(updated);
//       setSelected(updated[0] || null);
//       if (updated[0]) selectClaim(updated[0]);
//     } catch (err) { showToast("error", err.message); }
//     finally { setLoading(false); }
//   };

//   const handleReject = async () => {
//     setLoading(true);
//     try {
//       const res = await claimsApi.reject(selected.claimId);
//       showToast("error", `Claim #${res.data.claimId} → ${res.data.status}`);
//       const updated = claims.filter(c => c.claimId !== selected.claimId);
//       setClaims(updated);
//       setSelected(updated[0] || null);
//       if (updated[0]) selectClaim(updated[0]);
//     } catch (err) { showToast("error", err.message); }
//     finally { setLoading(false); }
//   };

//   return (
//     <div className="max-w-7xl mx-auto">
//       <div className="mb-5 flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-semibold text-gray-900">Investigation</h1>
//           <p className="text-sm text-gray-500 mt-1">All INVESTIGATING claims — review evidence, create reserve, approve or reject</p>
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
//           <span className="ml-3 text-gray-500 text-sm">Loading...</span>
//         </div>
//       ) : claims.length === 0 ? (
//         <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
//           <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
//           <p className="text-gray-500 text-sm font-medium">No claims in INVESTIGATING status</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
//           {/* Claims sidebar */}
//           <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//             <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
//               <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{claims.length} Claims</p>
//             </div>
//             <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
//               {claims.map(c => (
//                 <button key={c.claimId} onClick={() => selectClaim(c)}
//                   className={`w-full text-left px-4 py-3.5 transition-colors ${
//                     selected?.claimId === c.claimId ? "bg-blue-50 border-l-4 border-l-blue-600" : "hover:bg-gray-50"
//                   }`}>
//                   <p className="text-sm font-bold text-gray-900">#{c.claimId}</p>
//                   <p className="text-xs text-gray-500 mt-0.5">{c.claimType}</p>
//                   <p className="text-xs text-gray-400">Policy #{c.policyId}</p>
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Main */}
//           {selected && (
//             <div className="lg:col-span-2 space-y-5">
//               {/* Claim */}
//               <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
//                 <div className="flex items-center justify-between mb-3">
//                   <p className="text-sm font-semibold text-gray-900">Claim #{selected.claimId}</p>
//                   <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_BADGE[selected.status]}`}>{selected.status}</span>
//                 </div>
//                 <div className="grid grid-cols-2 gap-2 text-sm mb-3">
//                   <div><p className="text-xs text-gray-500">Policy</p><p className="font-medium">#{selected.policyId}</p></div>
//                   <div><p className="text-xs text-gray-500">Type</p><p className="font-medium">{selected.claimType}</p></div>
//                   <div><p className="text-xs text-gray-500">Incident</p><p className="font-medium">{selected.incidentDate}</p></div>
//                   <div><p className="text-xs text-gray-500">Reported</p><p className="font-medium">{selected.reportedDate}</p></div>
//                 </div>
//                 <p className="text-xs text-gray-500 mb-1">Description</p>
//                 <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-2.5">{selected.description}</p>
//               </div>

//               {/* Evidence */}
//               <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
//                 <p className="text-sm font-semibold text-gray-900 mb-3">
//                   Evidence <span className="text-xs font-normal text-gray-400">({evidence.length} files — customer uploaded)</span>
//                 </p>
//                 {evidence.length === 0 ? (
//                   <p className="text-sm text-gray-400 text-center py-4 bg-gray-50 rounded-lg">No evidence submitted yet</p>
//                 ) : evidence.map(e => (
//                   <div key={e.evidenceId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-2">
//                     <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
//                     <div>
//                       <div className="flex items-center gap-2">
//                         <p className="text-xs font-semibold text-gray-900">#{e.evidenceId}</p>
//                         <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded">{e.type}</span>
//                       </div>
//                       <p className="text-xs text-gray-400">{e.uploadedDate} · {e.uri?.split(/[/\\]/).pop()}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Reserves */}
//               <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
//                 <p className="text-sm font-semibold text-gray-900 mb-3">
//                   Reserves <span className="text-xs font-normal text-gray-400">({reserves.length})</span>
//                 </p>
//                 {reserves.map(r => (
//                   <div key={r.reserveId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
//                     <div>
//                       <p className="text-sm font-bold text-gray-900">${r.amount?.toLocaleString()}</p>
//                       <p className="text-xs text-gray-500">Reserve #{r.reserveId} · {r.createdDate}</p>
//                     </div>
//                     <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800">{r.status}</span>
//                   </div>
//                 ))}
//                 {reserves.length > 0 && (
//                   <p className="text-xs text-blue-700 font-semibold text-right mb-3">
//                     Total: ${reserves.reduce((s,r) => s+(r.amount||0), 0).toLocaleString()}
//                   </p>
//                 )}
//                 <div className="flex gap-3">
//                   <div className="relative flex-1">
//                     <span className="absolute left-3 top-2.5 text-gray-400 text-sm">$</span>
//                     <input type="number" min="0" step="0.01" placeholder="e.g. 1500.00"
//                       value={reserveAmt} onChange={e => setReserveAmt(e.target.value)}
//                       className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
//                   </div>
//                   <button onClick={handleCreateReserve} disabled={loading}
//                     className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50">
//                     <DollarSign className="w-4 h-4" /> Create
//                   </button>
//                 </div>
//               </div>

//               {/* Notes */}
//               <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
//                 <p className="text-sm font-semibold text-gray-900 mb-3">Notes</p>
//                 {notes.filter(n => n.claimId === selected.claimId).map(n => (
//                   <div key={n.id} className="p-2.5 bg-gray-50 rounded-lg mb-2">
//                     <p className="text-sm text-gray-900">{n.text}</p>
//                     <p className="text-xs text-gray-400 mt-0.5">{n.author} · {n.time}</p>
//                   </div>
//                 ))}
//                 <textarea rows={2} value={noteInput} onChange={e => setNoteInput(e.target.value)}
//                   placeholder="Add notes..."
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2" />
//                 <button onClick={() => {
//                   if (!noteInput.trim()) return;
//                   setNotes(prev => [{ id: Date.now(), claimId: selected.claimId, text: noteInput, author: "Vasudha", time: new Date().toLocaleString() }, ...prev]);
//                   setNoteInput("");
//                 }} className="px-4 py-1.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
//                   Save Note
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Actions + Checklist */}
//           {selected && (
//             <div className="space-y-5">
//               <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
//                 <p className="text-sm font-semibold text-gray-900 mb-3">Actions</p>
//                 <div className="space-y-2">
//                   <button onClick={handleApprove} disabled={loading}
//                     className="w-full flex items-center justify-center gap-2 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium disabled:opacity-50">
//                     <CheckCircle className="w-4 h-4" /> Approve → SETTLED
//                   </button>
//                   <button onClick={handleReject} disabled={loading}
//                     className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50">
//                     <XCircle className="w-4 h-4" /> Reject → DENIED
//                   </button>
//                 </div>
//               </div>
//               <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
//                 <p className="text-sm font-semibold text-gray-900 mb-3">Checklist</p>
//                 {CHECKLIST.map((item, i) => (
//                   <label key={i} className="flex items-center gap-2.5 py-1.5 cursor-pointer">
//                     <input type="checkbox" checked={!!checked[`${selected.claimId}-${i}`]}
//                       onChange={e => setChecked(prev => ({ ...prev, [`${selected.claimId}-${i}`]: e.target.checked }))}
//                       className="w-4 h-4 text-blue-600 rounded" />
//                     <span className={`text-xs ${checked[`${selected.claimId}-${i}`] ? "text-gray-400 line-through" : "text-gray-700"}`}>{item}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { FileText, CheckCircle, XCircle, RefreshCw, AlertCircle, UserCheck } from "lucide-react";
import { claimsApi, evidenceApi, assignmentApi } from "../../../services/api";
import { useNotifications } from "./NotificationContext";

const STATUS_BADGE = {
  OPEN:          "bg-blue-100 text-blue-800",
  INVESTIGATING: "bg-yellow-100 text-yellow-800",
  SETTLED:       "bg-green-100 text-green-800",
  DENIED:        "bg-red-100 text-red-800",
  CLOSED:        "bg-gray-100 text-gray-700",
};

const CHECKLIST = [
  "Review claim details",
  "Verify policy coverage",
  "Review submitted evidence",
  "Interview claimant",
  "Assess damage",
  "Determine liability",
  "Create reserve in Reserves page",
];

export function Investigation() {
  const [claims, setClaims]       = useState([]);
  const [selected, setSelected]   = useState(null);
  const [evidence, setEvidence]   = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [notes, setNotes]         = useState([]);
  const [noteInput, setNoteInput] = useState("");
  const [checked, setChecked]     = useState({});
  const [toast, setToast]         = useState(null);
  const [loading, setLoading]     = useState(false);
  const [fetching, setFetching]   = useState(false);
  const { refresh }               = useNotifications();

  const showToast = (type, text) => { setToast({ type, text }); setTimeout(() => setToast(null), 6000); };

  const loadClaims = async () => {
    setFetching(true);
    try {
      const res = await claimsApi.getByStatus("INVESTIGATING");
      setClaims(res.data || []);
      if (res.data?.length > 0) selectClaim(res.data[0]);
    } catch (err) { showToast("error", "Could not load claims: " + err.message); }
    finally { setFetching(false); }
  };

  const selectClaim = async (c) => {
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

  // Approve — requires assignment first
  const handleApprove = async () => {
    if (!assignment) {
      showToast("error", "⚠ Go to Claim Triage and assign this claim to Vasudha before approving.");
      return;
    }
    setLoading(true);
    try {
      const res = await claimsApi.approve(selected.claimId);
      refresh();
      showToast("success",
        `Claim #${res.data.claimId} → SETTLED. Now go to Reserves to create a reserve, then Settlements to process payment.`
      );
      const updated = claims.filter(c => c.claimId !== selected.claimId);
      setClaims(updated);
      setSelected(updated[0] || null);
      if (updated[0]) selectClaim(updated[0]);
    } catch (err) { showToast("error", err.message); }
    finally { setLoading(false); }
  };

  // Reject — requires assignment first
  const handleReject = async () => {
    if (!assignment) {
      showToast("error", "⚠ Go to Claim Triage and assign this claim to Vasudha before rejecting.");
      return;
    }
    setLoading(true);
    try {
      const res = await claimsApi.reject(selected.claimId);
      showToast("error", `Claim #${res.data.claimId} → DENIED`);
      const updated = claims.filter(c => c.claimId !== selected.claimId);
      setClaims(updated);
      setSelected(updated[0] || null);
      if (updated[0]) selectClaim(updated[0]);
    } catch (err) { showToast("error", err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Investigation</h1>
          <p className="text-sm text-gray-500 mt-1">Review evidence → Assign in Triage → Create Reserve → Approve or Reject</p>
        </div>
        <button onClick={loadClaims} disabled={fetching}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${fetching ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {toast && (
        <div className={`border rounded-lg p-4 mb-5 flex items-center gap-3 text-sm ${
          toast.type === "success" ? "bg-green-50 border-green-200 text-green-900" : "bg-red-50 border-red-200 text-red-900"
        }`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{toast.text}
        </div>
      )}

      {fetching ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-500 text-sm">Loading INVESTIGATING claims...</span>
        </div>
      ) : claims.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">No claims in INVESTIGATING status</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

          {/* Claims sidebar */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{claims.length} Claims</p>
            </div>
            <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
              {claims.map(c => (
                <button key={c.claimId} onClick={() => selectClaim(c)}
                  className={`w-full text-left px-4 py-3.5 transition-colors ${
                    selected?.claimId === c.claimId ? "bg-blue-50 border-l-4 border-l-blue-600" : "hover:bg-gray-50"
                  }`}>
                  <p className="text-sm font-bold text-gray-900">#{c.claimId}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.claimType}</p>
                  <p className="text-xs text-gray-400">Policy #{c.policyId}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Main content */}
          {selected && (
            <div className="lg:col-span-2 space-y-5">

              {/* Claim details */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-900">Claim #{selected.claimId}</p>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_BADGE[selected.status]}`}>{selected.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div><p className="text-xs text-gray-500">Policy</p><p className="font-medium">#{selected.policyId}</p></div>
                  <div><p className="text-xs text-gray-500">Type</p><p className="font-medium">{selected.claimType}</p></div>
                  <div><p className="text-xs text-gray-500">Incident</p><p className="font-medium">{selected.incidentDate}</p></div>
                  <div><p className="text-xs text-gray-500">Reported</p><p className="font-medium">{selected.reportedDate}</p></div>
                </div>
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-2.5">{selected.description}</p>
              </div>

              {/* Assignment status */}
              <div className={`rounded-xl border p-4 ${assignment ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}`}>
                <div className="flex items-center gap-2">
                  <UserCheck className={`w-4 h-4 ${assignment ? "text-green-600" : "text-orange-600"}`} />
                  {assignment ? (
                    <div>
                      <p className="text-sm font-semibold text-green-900">✓ Assigned to Vasudha</p>
                      <p className="text-xs text-green-700 mt-0.5">Priority: {assignment.priority} · Date: {assignment.assignmentDate}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-orange-900">⚠ Not yet assigned</p>
                      <p className="text-xs text-orange-700 mt-0.5">Go to <strong>Claim Triage</strong> to assign this claim before approving.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Evidence — customer uploaded, adjuster views only */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <p className="text-sm font-semibold text-gray-900 mb-3">
                  Evidence Submitted by Customer
                  <span className="ml-2 text-xs font-normal text-gray-400">({evidence.length} file{evidence.length !== 1 ? "s" : ""})</span>
                </p>
                {evidence.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4 bg-gray-50 rounded-lg">No evidence submitted yet</p>
                ) : evidence.map(e => (
                  <div key={e.evidenceId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-2 last:mb-0">
                    <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-gray-900">Evidence #{e.evidenceId}</p>
                        <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded">{e.type}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{e.uploadedDate} · {e.uri?.split(/[/\\]/).pop()}</p>
                    </div>
                    <span className="text-xs text-blue-600 font-medium px-2 py-1 rounded hover:bg-blue-50 cursor-pointer flex-shrink-0">View</span>
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <p className="text-sm font-semibold text-gray-900 mb-3">Investigation Notes</p>
                {notes.filter(n => n.claimId === selected.claimId).map(n => (
                  <div key={n.id} className="p-2.5 bg-gray-50 rounded-lg mb-2">
                    <p className="text-sm text-gray-900">{n.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{n.author} · {n.time}</p>
                  </div>
                ))}
                <textarea rows={2} value={noteInput} onChange={e => setNoteInput(e.target.value)}
                  placeholder="Add notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2" />
                <button onClick={() => {
                  if (!noteInput.trim()) return;
                  setNotes(prev => [{ id: Date.now(), claimId: selected.claimId, text: noteInput, author: "Vasudha", time: new Date().toLocaleString() }, ...prev]);
                  setNoteInput("");
                }} className="px-4 py-1.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
                  Save Note
                </button>
              </div>
            </div>
          )}

          {/* Actions + Checklist */}
          {selected && (
            <div className="space-y-5">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <p className="text-sm font-semibold text-gray-900 mb-3">Actions</p>

                {/* Required steps */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3">
                  <p className="text-xs font-semibold text-blue-800 mb-1.5">Required before approving:</p>
                  <div className="space-y-1">
                    <p className={`text-xs flex items-center gap-1.5 ${assignment ? "text-green-700" : "text-orange-700"}`}>
                      {assignment ? "✓" : "○"} Assigned in Claim Triage
                    </p>
                    <p className="text-xs text-blue-700 flex items-center gap-1.5">
                      ○ Reserve created in <strong>Reserves</strong> page
                    </p>
                    <p className="text-xs text-blue-700 flex items-center gap-1.5">
                      ○ Process in <strong>Settlements</strong> → CLOSED
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <button onClick={handleApprove} disabled={loading}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      assignment
                        ? "bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}>
                    <CheckCircle className="w-4 h-4" /> Approve → SETTLED
                  </button>
                  <button onClick={handleReject} disabled={loading}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      assignment
                        ? "bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}>
                    <XCircle className="w-4 h-4" /> Reject → DENIED
                  </button>
                </div>

                {!assignment && (
                  <p className="text-xs text-orange-700 mt-2 text-center font-medium">
                    Go to <strong>Claim Triage</strong> first
                  </p>
                )}
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <p className="text-sm font-semibold text-gray-900 mb-3">Checklist</p>
                {CHECKLIST.map((item, i) => (
                  <label key={i} className="flex items-center gap-2.5 py-1.5 cursor-pointer">
                    <input type="checkbox" checked={!!checked[`${selected.claimId}-${i}`]}
                      onChange={e => setChecked(prev => ({ ...prev, [`${selected.claimId}-${i}`]: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 rounded" />
                    <span className={`text-xs ${checked[`${selected.claimId}-${i}`] ? "text-gray-400 line-through" : "text-gray-700"}`}>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
