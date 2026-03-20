import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FileText, Filter, UserCheck, Search,
  DollarSign, FileCheck, Folder, BarChart3, Bell, Settings,
} from "lucide-react";
import { useNotifications, NotificationProvider } from "../pages/NotificationContext";
import { claimsApi } from "../../../core/services/api";
import DashboardShell from "../../../core/components/DashboardShell";

const NAV = [
  { path: "", icon: LayoutDashboard, label: "My Dashboard", end: true },
  { path: "fnol", icon: FileText, label: "FNOL Intake" },
  { path: "myclaims", icon: UserCheck, label: "My Claims" },
  { path: "triage", icon: Filter, label: "Claim Triage" },
  { path: "investigation", icon: Search, label: "Investigation" },
  { path: "reserves", icon: DollarSign, label: "Reserves" },
  { path: "settlements", icon: FileCheck, label: "Settlements" },
  { path: "evidence", icon: Folder, label: "Evidence" },
  { path: "reports", icon: BarChart3, label: "My Reports" },
];

function LayoutInner() {
  const notifyContext = useNotifications();
  const unreadCount = notifyContext ? notifyContext.unreadCount : 0;

  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, pending: 0, rate: 0 });

  // Load user from localStorage
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  })();
  const userName = storedUser.name || storedUser.username || "Adjuster";
  const userRole = storedUser.role || "Claims Adjuster";

  useEffect(() => {
    claimsApi.getAll().then(res => {
      const all = res.data || [];
      const pending = all.filter(c => ["OPEN", "INVESTIGATING"].includes(c.status)).length;
      const settled = all.filter(c => ["SETTLED", "CLOSED"].includes(c.status)).length;
      const rate = all.length > 0 ? Math.round((settled / all.length) * 100) : 0;
      setStats({ total: all.length, pending, rate });
    }).catch(() => { });
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Notification bell as extra header action
  const notifAction = (
    <button
      className="it-icon-btn"
      onClick={() => navigate("/adjuster-dashboard/notifications")}
      title="Notifications"
    >
      <Bell size={18} />
      {unreadCount > 0 && (
        <span className="it-notif-count">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );

  return (
    <DashboardShell
      navItems={NAV}
      logoSubtitle="Claims Portal"
      userName={userName}
      userRole={userRole}
      onLogout={handleLogout}
      extraHeaderActions={notifAction}
    />
  );
}

export function Layout() {
  return (
    <NotificationProvider>
      <LayoutInner />
    </NotificationProvider>
  );
}
