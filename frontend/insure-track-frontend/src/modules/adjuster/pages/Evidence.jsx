import { useState, useEffect } from "react";
import { FileText, RefreshCw, AlertCircle, Info, File } from "lucide-react";
import { evidenceApi, claimsApi } from "../../../services/api";

export function Evidence() {
  const [claims, setClaims]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [files, setFiles]     = useState([]);
  const [toast, setToast]     = useState(null);
  const [fetching, setFetching] = useState(false);

  const showToast = (type, text) => { setToast({ type, text }); setTimeout(() => setToast(null), 3000); };

  // Load all claims that could have evidence (not OPEN)
  const loadClaims = async () => {
    setFetching(true);
    try {
      const res = await claimsApi.getAll();
      const relevant = (res.data || []).filter(c => c.status !== "OPEN");
      setClaims(relevant);
      if (relevant.length > 0) selectClaim(relevant[0]);
    } catch (err) {
      showToast("error", "Could not load claims: " + err.message);
    } finally { setFetching(false); }
  };

  const selectClaim = async (c) => {
    setSelected(c);
    setFiles([]);
    try {
      const res = await evidenceApi.getByClaim(c.claimId);
      setFiles(Array.isArray(res.data) ? res.data : []);
    } catch (_) {}
  };

  useEffect(() => { loadClaims(); }, []);

  const STATUS_BADGE = {
    INVESTIGATING: "bg-yellow-100 text-yellow-800",
    SETTLED:       "bg-green-100 text-green-800",
    DENIED:        "bg-red-100 text-red-800",
    CLOSED:        "bg-gray-100 text-gray-700",
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Evidence</h1>
          <p className="text-sm text-gray-500 mt-1">View evidence submitted by customers</p>
        </div>
        <button onClick={loadClaims} disabled={fetching}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${fetching ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          Evidence is uploaded by the <strong>customer</strong> when filing their claim.
          Adjuster views are read-only.
        </p>
      </div>

      {toast && (
        <div className="border rounded-lg p-4 mb-5 flex items-center gap-3 text-sm bg-red-50 border-red-200 text-red-900">
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
          <File className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No claims with evidence yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Claims list */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
              <p className="text-sm font-semibold text-gray-900">{claims.length} Claims</p>
            </div>
            <div className="divide-y divide-gray-50 max-h-[540px] overflow-y-auto">
              {claims.map(c => (
                <button key={c.claimId} onClick={() => selectClaim(c)}
                  className={`w-full text-left px-5 py-4 transition-colors ${
                    selected?.claimId === c.claimId ? "bg-blue-50 border-l-4 border-l-blue-600" : "hover:bg-gray-50"
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

          {/* Evidence list */}
          {selected && (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">
                    Evidence for Claim #{selected.claimId}
                    <span className="ml-2 text-xs font-normal text-gray-400">({files.length} file{files.length !== 1 ? "s" : ""})</span>
                  </p>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_BADGE[selected.status] || "bg-gray-100 text-gray-700"}`}>{selected.status}</span>
                </div>
                {files.length === 0 ? (
                  <div className="py-16 text-center">
                    <File className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">No evidence files submitted for this claim</p>
                    <p className="text-xs text-gray-400 mt-1">Customer hasn't uploaded any files yet</p>
                  </div>
                ) : files.map(f => (
                  <div key={f.evidenceId} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">Evidence #{f.evidenceId}</p>
                          <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">{f.type}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">Uploaded: {f.uploadedDate}</p>
                        <p className="text-xs text-gray-400 truncate max-w-md">{f.uri?.split(/[/\\]/).pop()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
