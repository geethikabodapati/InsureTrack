import { useEffect } from "react";
import { Bell, Check, AlertCircle, CheckCircle, Trash2, FileCheck, RefreshCw, FileText } from "lucide-react";
import { useNotifications } from "./NotificationContext";
import '../styles/adjuster.css';
 
const TYPE_CFG = {
  ASSIGNMENT: { Icon: Bell,         iconClass: "adj-notif-icon-assignment", label: "Assignment" },
  CLAIM:      { Icon: FileText,     iconClass: "adj-notif-icon-claim",      label: "Claim"      },
  SETTLEMENT: { Icon: FileCheck,    iconClass: "adj-notif-icon-settlement", label: "Settlement" },
  APPROVED:   { Icon: CheckCircle,  iconClass: "adj-notif-icon-approved",   label: "Approved"   },
  INFO:       { Icon: AlertCircle,  iconClass: "adj-notif-icon-info",       label: "Info"       },
  assignment: { Icon: Bell,         iconClass: "adj-notif-icon-assignment", label: "Assignment" },
  claim:      { Icon: FileText,     iconClass: "adj-notif-icon-claim",      label: "Claim"      },
  settlement: { Icon: FileCheck,    iconClass: "adj-notif-icon-settlement", label: "Settlement" },
};
 
const BADGE = {
  ASSIGNMENT: "adj-badge adj-badge-open",
  CLAIM:      "adj-badge",
  SETTLEMENT: "adj-badge adj-badge-settled",
  APPROVED:   "adj-badge adj-badge-settled",
  assignment: "adj-badge adj-badge-open",
  claim:      "adj-badge",
  settlement: "adj-badge adj-badge-settled",
};
 
export function Notifications() {
  const { notifications, loading, markRead, markAllRead, remove, fetchNotifications } = useNotifications();
 
  // Issue 8: The backend returns status field (UNREAD/READ/DISMISSED)
  // We must check BOTH n.read === false AND n.status === "UNREAD" to be safe
  const isUnread = (n) => {
    // If backend sends a boolean 'read' field
    if (typeof n.read === "boolean") return !n.read;
    // If backend sends a string 'status' field (our backend uses NotificationStatus enum)
    if (n.status) return n.status === "UNREAD";
    // Default: treat as unread if neither field present
    return true;
  };
 
  const unread = notifications.filter(isUnread).length;
 
  useEffect(() => { fetchNotifications(); }, []);
 
  return (
    <div className="adj-page" style={{ maxWidth: 800, margin: "0 auto" }}>
      <div className="adj-page-header">
        <div>
          <h1 className="adj-page-title">Notifications</h1>
          <p className="adj-page-sub">Live updates from your backend</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Issue 8: Mark all read — show whenever there are unread */}
          {unread > 0 && (
            <button onClick={markAllRead} className="adj-mark-all-btn">
              <Check size={13} style={{ marginRight: 4 }} />
              Mark all read ({unread})
            </button>
          )}
          <button onClick={fetchNotifications} disabled={loading} className="adj-refresh-btn">
            <RefreshCw size={14} className={loading ? "adj-spin" : ""} /> Refresh
          </button>
        </div>
      </div>
 
      <div className="adj-notif-stats">
        <div className="adj-notif-stat-card">
          <p className="adj-notif-stat-val gray">{notifications.length}</p>
          <p className="adj-notif-stat-lbl">Total</p>
        </div>
        <div className="adj-notif-stat-card">
          <p className="adj-notif-stat-val blue">{unread}</p>
          <p className="adj-notif-stat-lbl">Unread</p>
        </div>
        <div className="adj-notif-stat-card">
          <p className="adj-notif-stat-val green">{notifications.length - unread}</p>
          <p className="adj-notif-stat-lbl">Read</p>
        </div>
      </div>
 
      <div className="adj-table-wrap">
        {loading && notifications.length === 0 ? (
          <div className="adj-loading">
            <RefreshCw size={24} className="adj-spin" /><span>Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="adj-table-empty">
            <Bell size={48} style={{ color: "#e5e7eb", margin: "0 auto 12px", display: "block" }} />
            <p style={{ fontWeight: 600, color: "#6b7280" }}>No notifications yet</p>
            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
              Notifications appear when claims are assigned or settled
            </p>
          </div>
        ) : (
          notifications.map(n => {
            const category   = n.category || n.type || "INFO";
            const cfg        = TYPE_CFG[category] || TYPE_CFG.INFO;
            const unreadItem = isUnread(n);
            const nId        = n.notificationId || n.id;
 
            return (
              <div key={nId}
                className={`adj-notif-item ${unreadItem ? "unread" : ""}`}
                style={{ background: unreadItem ? "rgba(239,246,255,0.6)" : "transparent" }}>
 
                <div className={`adj-notif-icon-wrap ${cfg.iconClass}`}>
                  <cfg.Icon size={18} />
                </div>
 
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <p className={`adj-notif-title ${unreadItem ? "" : "read"}`}>
                          {n.title || n.message}
                        </p>
                        {/* Issue 8: unread dot — only shown when actually unread */}
                        {unreadItem && <span className="adj-notif-unread-dot" />}
                        <span className={BADGE[category] || "adj-badge"} style={{ fontSize: 10 }}>
                          {cfg.label}
                        </span>
                      </div>
                      {n.title && n.message && n.title !== n.message && (
                        <p className="adj-notif-body">{n.message}</p>
                      )}
                      <p className="adj-notif-time">{n.createdDate || n.createdAt || n.time || ""}</p>
                    </div>
 
                    <div className="adj-notif-actions">
                      {/* Issue 8: mark-read button shown for all unread items */}
                      {unreadItem && (
                        <button
                          onClick={() => markRead(nId)}
                          className="adj-notif-action-btn"
                          title="Mark as read"
                          style={{ color: "#3b82f6" }}>
                          <Check size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => remove(nId)}
                        className="adj-notif-action-btn danger"
                        title="Dismiss">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
 