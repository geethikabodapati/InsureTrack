import { useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import { claimsApi } from "../../../services/api";

const STEPS = [
  { status: "OPEN",          label: "1. OPEN",         desc: "Customer filed FNOL",        color: "bg-blue-600"   },
  { status: "INVESTIGATING", label: "2. INVESTIGATING", desc: "Moved to review → assigned", color: "bg-yellow-500" },
  { status: "SETTLED",       label: "3. SETTLED",       desc: "Adjuster approved",          color: "bg-green-600"  },
  { status: "CLOSED",        label: "4. CLOSED",        desc: "Settlement paid",            color: "bg-gray-500"   },
];

const STATUS_BADGE = {
  OPEN:          "bg-blue-100 text-blue-800",
  INVESTIGATING: "bg-yellow-100 text-yellow-800",
  SETTLED:       "bg-green-100 text-green-800",
  DENIED:        "bg-red-100 text-red-800",
  CLOSED:        "bg-gray-100 text-gray-700",
};

export function Dashboard() {
  const [searchId, setSearchId] = useState("");
  const [claim, setClaim]       = useState(null);
  const [fetching, setFetching] = useState(false);
  const [toast, setToast]       = useState(null);

  const showToast = (type, text) => { setToast({ type, text }); setTimeout(() => setToast(null), 4000); };

  const fetchClaim = async () => {
    if (!searchId.trim()) return;
    setFetching(true); setClaim(null);
    try {
      const res = await claimsApi.getById(searchId.trim());
      setClaim(res.data);
    } catch (err) { showToast("error", err.message || "Claim not found"); }
    finally { setFetching(false); }
  };

  const stepIndex = STEPS.findIndex(s => s.status === claim?.status);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Good morning, Vasudha 👋</h1>
        <p className="text-sm text-gray-500 mt-1">Senior Adjuster · InsureTrack Claims Portal</p>
      </div>

      {toast && (
        <div className="border rounded-lg p-4 flex items-center gap-3 text-sm bg-red-50 border-red-200 text-red-900">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{toast.text}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <p className="text-sm font-semibold text-gray-900 mb-3">Look Up a Claim</p>
        <div className="flex gap-3">
          <input type="number" placeholder="Enter Claim ID (e.g. 4)" value={searchId}
            onChange={e => setSearchId(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fetchClaim()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button onClick={fetchClaim} disabled={fetching}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${fetching ? "animate-spin" : ""}`} /> Search
          </button>
        </div>
      </div>

      {claim && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-lg font-bold text-gray-900">Claim #{claim.claimId}</p>
              <p className="text-sm text-gray-500 mt-0.5">{claim.claimType} · Policy #{claim.policyId}</p>
            </div>
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${STATUS_BADGE[claim.status]}`}>{claim.status}</span>
          </div>

          {claim.status !== "DENIED" && (
            <div className="mb-5">
              <div className="flex items-center">
                {STEPS.map((step, i) => {
                  const isActive = claim.status === step.status;
                  const isPast   = stepIndex > i;
                  return (
                    <div key={step.status} className="flex items-center flex-1">
                      <div className="flex-1 text-center">
                        <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold ${
                          isActive ? `${step.color} text-white ring-4 ring-offset-2 ring-blue-200` :
                          isPast   ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
                        }`}>{i + 1}</div>
                        <p className={`text-xs mt-1 font-medium ${isActive ? "text-gray-900" : "text-gray-400"}`}>{step.label}</p>
                        <p className="text-xs text-gray-400">{step.desc}</p>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`h-0.5 flex-1 -mx-2 ${isPast ? "bg-green-400" : "bg-gray-200"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {claim.status === "DENIED" && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-center">
              <span className="text-sm font-semibold text-red-700">✗ Claim DENIED</span>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[["Incident Date",claim.incidentDate],["Reported Date",claim.reportedDate],
              ["Claim Type",claim.claimType],["Policy ID",`#${claim.policyId}`]].map(([k,v]) => (
              <div key={k} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">{k}</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{v}</p>
              </div>
            ))}
            <div className="col-span-2 md:col-span-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Description</p>
              <p className="text-sm text-gray-900">{claim.description}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <p className="text-sm font-semibold text-gray-900 mb-3">Your Workflow</p>
        <div className="space-y-2">
          {[
            { step:"1", page:"FNOL Intake",   desc:"Auto-loads OPEN claims → Move to Investigation or Reject",                    color:"bg-blue-600"   },
            { step:"2", page:"Claim Triage",  desc:"Auto-loads INVESTIGATING claims → Assign to Vasudha with priority",           color:"bg-yellow-500" },
            { step:"3", page:"Investigation", desc:"Review evidence → Create reserve → Approve (SETTLED) or Reject (DENIED)",     color:"bg-purple-600" },
            { step:"4", page:"Settlements",   desc:"Auto-loads SETTLED claims → Enter amount → Process payment → CLOSED",        color:"bg-green-600"  },
          ].map(item => (
            <div key={item.step} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-6 h-6 rounded-full ${item.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5`}>{item.step}</div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{item.page}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
