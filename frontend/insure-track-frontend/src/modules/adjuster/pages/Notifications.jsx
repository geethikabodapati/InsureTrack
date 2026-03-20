import { useEffect } from "react";
import { Bell, Check, AlertCircle, CheckCircle, Trash2, FileCheck, RefreshCw, FileText } from "lucide-react";
import { useNotifications } from "./NotificationContext";

const TYPE_CFG = {
  ASSIGNMENT: { Icon: Bell,        bg: "bg-blue-50",   icon: "text-blue-600",  label: "Assignment" },
  CLAIM:      { Icon: FileText,    bg: "bg-orange-50", icon: "text-orange-500",label: "Claim"      },
  SETTLEMENT: { Icon: FileCheck,   bg: "bg-green-50",  icon: "text-green-600", label: "Settlement" },
  APPROVED:   { Icon: CheckCircle, bg: "bg-teal-50",   icon: "text-teal-600",  label: "Approved"   },
  INFO:       { Icon: AlertCircle, bg: "bg-gray-100",  icon: "text-gray-500",  label: "Info"       },
  assignment: { Icon: Bell,        bg: "bg-blue-50",   icon: "text-blue-600",  label: "Assignment" },
  claim:      { Icon: FileText,    bg: "bg-orange-50", icon: "text-orange-500",label: "Claim"      },
  settlement: { Icon: FileCheck,   bg: "bg-green-50",  icon: "text-green-600", label: "Settlement" },
};

const BADGE_COLOR = {
  ASSIGNMENT: "bg-blue-100 text-blue-700",
  CLAIM:      "bg-orange-100 text-orange-700",
  SETTLEMENT: "bg-green-100 text-green-700",
  APPROVED:   "bg-teal-100 text-teal-700",
  assignment: "bg-blue-100 text-blue-700",
  claim:      "bg-orange-100 text-orange-700",
  settlement: "bg-green-100 text-green-700",
};

export function Notifications() {
  const { notifications, loading, markRead, markAllRead, remove, fetchNotifications } = useNotifications();
  const isUnread = (n) => n.read === false || n.status === "UNREAD";
  const unread = notifications.filter(isUnread).length;

  useEffect(() => { fetchNotifications(); }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">Live updates from your backend</p>
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button onClick={markAllRead}
              className="text-sm text-blue-600 font-medium px-4 py-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              Mark all read
            </button>
          )}
          <button onClick={fetchNotifications} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{unread}</p>
          <p className="text-xs text-gray-500 mt-0.5">Unread</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{notifications.length - unread}</p>
          <p className="text-xs text-gray-500 mt-0.5">Read</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-50">
        {loading && notifications.length === 0 ? (
          <div className="py-16 text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center">
            <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">No notifications yet</p>
            <p className="text-gray-400 text-xs mt-1">Notifications appear when claims are assigned or settled</p>
          </div>
        ) : notifications.map(n => {
          const category = n.category || n.type || "INFO";
          const cfg = TYPE_CFG[category] || TYPE_CFG.INFO;
          const unreadItem = isUnread(n);
          const nId = n.notificationId || n.id;

          return (
            <div key={nId}
              className={`flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors ${unreadItem ? "bg-blue-50/40" : ""}`}>
              <div className={`w-10 h-10 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <cfg.Icon className={`w-5 h-5 ${cfg.icon}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-semibold ${unreadItem ? "text-gray-900" : "text-gray-700"}`}>
                        {n.title || n.message}
                      </p>
                      {unreadItem && <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BADGE_COLOR[category] || "bg-gray-100 text-gray-600"}`}>
                        {cfg.label}
                      </span>
                    </div>
                    {n.title && n.message && n.title !== n.message && (
                      <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{n.createdAt || n.time || ""}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                    {unreadItem && (
                      <button onClick={() => markRead(nId)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                        <Check className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                    )}
                    <button onClick={() => remove(nId)} className="p-1.5 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
