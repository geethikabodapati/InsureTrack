import { useState, useEffect } from "react";
import { AlertCircle, RefreshCw, UserCheck } from "lucide-react";
import { claimsApi, assignmentApi } from "../../../core/services/api";
import { useNotifications } from "./NotificationContext";

const JOHN_DOE_ADJUSTER_ID = 5;

const PRIORITY_STYLE = {
  HIGH: "border-red-400 bg-red-50 text-red-700",
  MEDIUM: "border-yellow-400 bg-yellow-50 text-yellow-700",
  LOW: "border-green-400 bg-green-50 text-green-700",
};

const STATUS_BADGE = {
  OPEN: "bg-blue-100 text-blue-800",
  INVESTIGATING: "bg-yellow-100 text-yellow-800",
  SETTLED: "bg-green-100 text-green-800",
  DENIED: "bg-red-100 text-red-800",
  CLOSED: "bg-gray-100 text-gray-700",
};

export function ClaimTriage() {
  const [claims, setClaims] = useState([]);
  const [selected, setSelected] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [priority, setPriority] = useState("HIGH");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const { refresh } = useNotifications();

  const showToast = (type, text) => { setToast({ type, text }); setTimeout(() => setToast(null), 4000); };

  const loadClaims = async () => {
    setFetching(true);
    try {
      const res = await claimsApi.getByStatus("INVESTIGATING");
      setClaims(res.data || []);
      if (res.data?.length > 0) {
        setSelected(res.data[0]);
        loadAssignment(res.data[0].claimId);
      }
    } catch (err) {
      showToast("error", "Could not load claims: " + err.message);
    } finally { setFetching(false); }
  };

  const loadAssignment = async (claimId) => {
    setAssignment(null);
    try {
      const res = await assignmentApi.getByClaim(claimId);
      setAssignment(res.data);
    } catch (_) { }
  };

  useEffect(() => { loadClaims(); }, []);

  const handleSelect = (c) => {
    setSelected(c);
    loadAssignment(c.claimId);
  };

  const handleAssign = async () => {
    setLoading(true);
    try {
      const res = await assignmentApi.assign(selected.claimId, {
        adjusterId: JOHN_DOE_ADJUSTER_ID,
        priority: priority,
      });
      setAssignment(res.data);
      // ── Fire notification ──
      refresh();
      showToast("success",
        `Claim #${res.data.claimId} assigned · Assignment #${res.data.assignmentId} · Priority: ${res.data.priority}`);
    } catch (err) { showToast("error", err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Claim Triage</h1>
          <p className="text-sm text-gray-500 mt-1">All INVESTIGATING claims — assign adjuster and set priority</p>
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
          <span className="ml-3 text-gray-500 text-sm">Loading INVESTIGATING claims...</span>
        </div>
      ) : claims.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <UserCheck className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">No claims in INVESTIGATING status</p>
          <p className="text-gray-400 text-xs mt-1">Go to FNOL Intake to move OPEN claims to Investigation first</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Claims list */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
              <p className="text-sm font-semibold text-gray-900">{claims.length} Claim{claims.length !== 1 ? "s" : ""} to Assign</p>
            </div>
            <div className="divide-y divide-gray-50 max-h-[520px] overflow-y-auto">
              {claims.map(c => (
                <button key={c.claimId} onClick={() => handleSelect(c)}
                  className={`w-full text-left px-5 py-4 transition-colors ${selected?.claimId === c.claimId ? "bg-blue-50 border-l-4 border-l-blue-600" : "hover:bg-gray-50"
                    }`}>
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-bold text-gray-900">Claim #{c.claimId}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[c.status]}`}>{c.status}</span>
                  </div>
                  <p className="text-xs text-gray-500">{c.claimType}</p>
                  <p className="text-xs text-gray-400">Policy #{c.policyId} · {c.incidentDate}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Detail + assignment */}
          {selected && (
            <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Claim info */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-gray-900">Claim #{selected.claimId}</p>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_BADGE[selected.status]}`}>{selected.status}</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">Policy ID</span><span className="font-medium">#{selected.policyId}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">Type</span><span className="font-medium">{selected.claimType}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">Incident</span><span className="font-medium">{selected.incidentDate}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">Reported</span><span className="font-medium">{selected.reportedDate}</span>
                  </div>
                  <div className="pt-1">
                    <p className="text-gray-500 text-xs mb-1">Description</p>
                    <p className="text-gray-900 bg-gray-50 rounded-lg p-2.5 text-xs">{selected.description}</p>
                  </div>
                </div>
              </div>

              {/* Assignment */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <p className="text-sm font-semibold text-gray-900 mb-4">Assign Adjuster</p>
                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg mb-4">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">VA</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Vasudha</p>
                    <p className="text-xs text-gray-500">Senior Adjuster · ID: {JOHN_DOE_ADJUSTER_ID}</p>
                  </div>
                  <span className="ml-auto text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Active</span>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Priority</p>
                  <div className="grid grid-cols-3 gap-2">
                    {["LOW", "MEDIUM", "HIGH"].map(p => (
                      <button key={p} onClick={() => setPriority(p)}
                        className={`py-2 rounded-lg border-2 text-sm font-medium transition-all ${priority === p ? PRIORITY_STYLE[p] : "border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}>{p}</button>
                    ))}
                  </div>
                </div>

                {assignment ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs font-semibold text-green-800 mb-2">✓ Already Assigned</p>
                    <div className="grid grid-cols-2 gap-1 text-xs text-green-900">
                      <span className="text-green-700">Assignment ID:</span><span>#{assignment.assignmentId}</span>
                      <span className="text-green-700">Adjuster ID:</span><span>{assignment.adjusterId}</span>
                      <span className="text-green-700">Priority:</span><span>{assignment.priority}</span>
                      <span className="text-green-700">Date:</span><span>{assignment.assignmentDate}</span>
                    </div>
                  </div>
                ) : (
                  <button onClick={handleAssign} disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 transition-colors">
                    <UserCheck className="w-4 h-4" />
                    {loading ? "Assigning..." : "Assign to Vasudha"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
