import { useState, useEffect } from "react";
import { BarChart3, RefreshCw, AlertCircle, FileText, DollarSign, CheckCircle, XCircle, Clock } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import api from "../../../core/services/api";

// GET /api/adjuster/reports/summary
// Returns: { totalClaims, openClaims, investigatingClaims, settledClaims,
//            deniedClaims, closedClaims, totalReserveAmount, totalSettlementAmount,
//            claimsByStatus: [{status, count}], recentClaims: [{claimId, claimType, status, reportedDate}] }

const PIE_COLORS = {
  OPEN: "#3b82f6",
  INVESTIGATING: "#f59e0b",
  SETTLED: "#10b981",
  DENIED: "#ef4444",
  CLOSED: "#6b7280",
};

export function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, text) => { setToast({ type, text }); setTimeout(() => setToast(null), 4000); };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get("/adjuster/reports/summary");
      setData(res.data);
    } catch (err) {
      showToast("error", err.message || "Failed to load report");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchReport(); }, []);

  const STATUS_BADGE = {
    OPEN: "bg-blue-100 text-blue-800",
    INVESTIGATING: "bg-yellow-100 text-yellow-800",
    SETTLED: "bg-green-100 text-green-800",
    DENIED: "bg-red-100 text-red-800",
    CLOSED: "bg-gray-100 text-gray-700",
  };

  const STAT_CARDS = data ? [
    { label: "Total Claims", value: data.totalClaims, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Open", value: data.openClaims, icon: Clock, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Investigating", value: data.investigatingClaims, icon: BarChart3, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Settled", value: data.settledClaims, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "Denied", value: data.deniedClaims, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
    { label: "Closed", value: data.closedClaims, icon: CheckCircle, color: "text-gray-600", bg: "bg-gray-50" },
    { label: "Total Reserved", value: `$${(data.totalReserveAmount || 0).toLocaleString()}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
    { label: "Total Settled", value: `$${(data.totalSettlementAmount || 0).toLocaleString()}`, icon: DollarSign, color: "text-teal-600", bg: "bg-teal-50" },
  ] : [];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Live data from your backend · GET /adjuster/reports/summary</p>
        </div>
        <button onClick={fetchReport} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {toast && (
        <div className={`border rounded-lg p-4 mb-5 flex items-center gap-3 text-sm ${toast.type === "success" ? "bg-green-50 border-green-200 text-green-900" : "bg-red-50 border-red-200 text-red-900"
          }`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{toast.text}
        </div>
      )}

      {loading && !data && (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-500 text-sm">Loading report data...</span>
        </div>
      )}

      {data && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {STAT_CARDS.map((c, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500">{c.label}</p>
                  <div className={`w-7 h-7 rounded-lg ${c.bg} flex items-center justify-center`}>
                    <c.icon className={`w-3.5 h-3.5 ${c.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{c.value}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            {/* Pie — claims by status */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-900 mb-4">Claims by Status</p>
              {data.claimsByStatus && data.claimsByStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={data.claimsByStatus}
                      dataKey="count"
                      nameKey="status"
                      cx="50%" cy="50%"
                      outerRadius={95}
                      label={({ status, count }) => `${status}: ${count}`}
                      labelLine={false}
                    >
                      {data.claimsByStatus.map((entry, i) => (
                        <Cell key={i} fill={PIE_COLORS[entry.status] || "#9ca3af"} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val, name) => [val, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400 text-sm">No data</div>
              )}
            </div>

            {/* Bar — reserve vs settlement */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-900 mb-4">Reserve vs Settlement Amount</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={[
                  { label: "Reserved", amount: data.totalReserveAmount || 0 },
                  { label: "Settled", amount: data.totalSettlementAmount || 0 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="label" fontSize={12} stroke="#9ca3af" />
                  <YAxis fontSize={11} stroke="#9ca3af"
                    tickFormatter={v => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`} />
                  <Tooltip formatter={v => `$${v.toLocaleString()}`} />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]}
                    fill="#3b82f6"
                    label={{ position: "top", fontSize: 11, formatter: v => `$${v.toLocaleString()}` }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Claims Table */}
          {data.recentClaims && data.recentClaims.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">Recent Claims</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {["Claim ID", "Type", "Reported Date", "Status"].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.recentClaims.map((c, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3.5 font-semibold text-blue-600">#{c.claimId}</td>
                        <td className="px-6 py-3.5 text-gray-700">{c.claimType}</td>
                        <td className="px-6 py-3.5 text-gray-600">{c.reportedDate}</td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[c.status] || "bg-gray-100 text-gray-700"}`}>{c.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
