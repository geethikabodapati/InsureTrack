import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FileText, Filter, UserCheck, Search,
  DollarSign, FileCheck, Folder, BarChart3, Bell, Settings,
  Menu, X, Shield,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNotifications } from "../pages/NotificationContext";
import { claimsApi } from "../../../services/api";

const ADJUSTER = { name: "Vasudha", initials: "VA", role: "Adjuster" };

const NAV = [
  { path: "/adjuster",             icon: LayoutDashboard, label: "My Dashboard"  },
  { path: "/adjuster/fnol",         icon: FileText,        label: "FNOL Intake"   },
  { path: "/adjuster/myclaims",     icon: UserCheck,       label: "My Claims"     },
  { path: "/adjuster/triage",       icon: Filter,          label: "Claim Triage"  },
  { path: "/adjuster/investigation",icon: Search,          label: "Investigation" },
  { path: "/adjuster/reserves",     icon: DollarSign,      label: "Reserves"      },
  { path: "/adjuster/settlements",  icon: FileCheck,       label: "Settlements"   },
  { path: "/adjuster/evidence",     icon: Folder,          label: "Evidence"      },
  { path: "/adjuster/reports",      icon: BarChart3,       label: "My Reports"    },
];

export function Layout() {
  const [open, setOpen]     = useState(true);
  const { unreadCount }     = useNotifications();
  const navigate            = useNavigate();
  const [stats, setStats]   = useState({ total: 0, pending: 0, rate: 0 });

  useEffect(() => {
    claimsApi.getAll().then(res => {
      const all     = res.data || [];
      const pending = all.filter(c => ["OPEN","INVESTIGATING"].includes(c.status)).length;
      const settled = all.filter(c => ["SETTLED","CLOSED"].includes(c.status)).length;
      const rate    = all.length > 0 ? Math.round((settled / all.length) * 100) : 0;
      setStats({ total: all.length, pending, rate });
    }).catch(() => {});
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${open ? "w-64" : "w-0"} bg-slate-900 text-white transition-all duration-300 overflow-hidden flex-shrink-0 flex flex-col`}>
        {/* Brand */}
        <div className="px-5 py-4 border-b border-slate-700 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">InsureTrack</p>
            <p className="text-xs text-slate-400 mt-0.5">Claims Portal</p>
          </div>
        </div>

        {/* Adjuster profile card — live stats */}
        <div className="mx-3 mt-4 mb-2 bg-white/5 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-base font-bold flex-shrink-0">
              {ADJUSTER.initials}
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none">{ADJUSTER.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{ADJUSTER.role}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                <span className="text-[10px] text-green-400 font-medium">Online</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1 text-center">
            {[[stats.total, "Claims"], [stats.pending, "Pending"], [`${stats.rate}%`, "Rate"]].map(([v, l]) => (
              <div key={l} className="bg-white/5 rounded py-1">
                <p className="text-sm font-bold text-blue-400">{v}</p>
                <p className="text-[9px] text-slate-500 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto">
          <ul className="space-y-0.5">
            {NAV.map((item) => (
              <li key={item.path}>
                <NavLink to={item.path} end={item.path === "/"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isActive ? "bg-blue-600 text-white font-medium" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`
                  }>
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate flex-1">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-5 py-3 border-t border-slate-700">
          <p className="text-xs text-slate-500">InsureTrack v1.0</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setOpen(!open)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              {open ? <X className="w-4 h-4 text-gray-600" /> : <Menu className="w-4 h-4 text-gray-600" />}
            </button>
            <div>
              <p className="text-sm font-semibold text-gray-900 leading-none">InsureTrack – Claims Dashboard</p>
              <p className="text-xs text-gray-500 mt-0.5">Welcome, {ADJUSTER.name}</p>
            </div>
          </div>

          {/* Right — bell + settings + avatar */}
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/notifications")}
              className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors group">
              <Bell className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <button onClick={() => navigate("/settings")}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors group">
              <Settings className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <div onClick={() => navigate("/settings")}
              className="flex items-center gap-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl px-3 py-2 cursor-pointer transition-colors">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {ADJUSTER.initials}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900 leading-none">{ADJUSTER.name}</p>
                <p className="text-[10px] text-green-600 mt-0.5">● Online</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
