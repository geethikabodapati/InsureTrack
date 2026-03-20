import { useState, useEffect } from "react";
import { RefreshCw, AlertCircle, Search } from "lucide-react";
import { claimsApi } from "../../../core/services/api";

const STATUS_STYLE = {
  OPEN: "bg-blue-100 text-blue-800",
  INVESTIGATING: "bg-yellow-100 text-yellow-800",
  SETTLED: "bg-green-100 text-green-800",
  DENIED: "bg-red-100 text-red-800",
  CLOSED: "bg-gray-100 text-gray-700",
};

const STATUSES = ["ALL", "OPEN", "INVESTIGATING", "SETTLED", "DENIED", "CLOSED"];

export function MyClaims() {
  const [claims, setClaims] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [fetching, setFetching] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, text) => { setToast({ type, text }); setTimeout(() => setToast(null), 3000); };

  const loadClaims = async () => {
    setFetching(true);
    try {
      const res = await claimsApi.getAll();
      setClaims(res.data || []);
    } catch (err) {
      showToast("error", "Could not load claims: " + err.message);
    } finally { setFetching(false); }
  };

  useEffect(() => { loadClaims(); }, []);

  const filtered = claims
    .filter(c => filter === "ALL" || c.status === filter)
    .filter(c => {
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return (
        String(c.claimId).includes(s) ||
        String(c.policyId).includes(s) ||
        (c.claimType || "").toLowerCase().includes(s) ||
        (c.description || "").toLowerCase().includes(s)
      );
    });

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = s === "ALL" ? claims.length : claims.filter(c => c.status === s).length;
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Claims</h1>
          <p className="text-sm text-gray-500 mt-1">All claims in the system</p>
        </div>
        <button onClick={loadClaims} disabled={fetching}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${fetching ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {toast && (
        <div className="border rounded-lg p-4 mb-4 flex items-center gap-3 text-sm bg-red-50 border-red-200 text-red-900">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{toast.text}
        </div>
      )}

      {/* Status filter buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${filter === s
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-white border-gray-200 text-gray-700 hover:border-blue-300"
              }`}>
            {s} <span className={`ml-1 text-xs font-bold ${filter === s ? "text-blue-100" : "text-gray-400"}`}>
              ({counts[s]})
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search by ID, policy, type, description..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
      </div>

      {/* Table */}
      {fetching ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-500 text-sm">Loading claims...</span>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">
              {filtered.length} claim{filtered.length !== 1 ? "s" : ""}
              {filter !== "ALL" && ` · ${filter}`}
              {search && ` · matching "${search}"`}
            </p>
          </div>
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">No claims found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Claim ID", "Policy ID", "Type", "Incident Date", "Reported Date", "Status"].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(c => (
                    <tr key={c.claimId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-blue-600">#{c.claimId}</td>
                      <td className="px-5 py-3.5 text-gray-500">#{c.policyId}</td>
                      <td className="px-5 py-3.5 text-gray-700">{c.claimType}</td>
                      <td className="px-5 py-3.5 text-gray-600">{c.incidentDate}</td>
                      <td className="px-5 py-3.5 text-gray-600">{c.reportedDate}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[c.status] || "bg-gray-100 text-gray-700"}`}>{c.status}</span>
                      </td>
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
