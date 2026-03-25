import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardShell from "../../../core/components/DashboardShell";
import { NotificationProvider } from "../pages/NotificationContext";
import {
  LayoutDashboard, FileText, Filter, UserCheck, Search,
  DollarSign, FileCheck, Folder, BarChart3, Bell, Settings
} from "lucide-react";
 
// Adjuster Sidebar Items
const ADJUSTER_NAV = [
  { path: "", label: "Dashboard", icon: LayoutDashboard, end: true },
  { path: "fnol", label: "FNOL Intake", icon: FileText },
  { path: "myclaims", label: "Claims", icon: UserCheck },
  { path: "triage", label: "Claim Triage", icon: Filter },
  { path: "investigation", label: "Investigation", icon: Search },
  { path: "reserves", label: "Reserves", icon: DollarSign },
  { path: "settlements", label: "Settlements", icon: FileCheck },
  { path: "evidence", label: "Evidence", icon: Folder },
  { path: "reports", label: "Reports", icon: BarChart3 },
  // { path: "notifications", label: "Notifications", icon: Bell },
  { path: "settings", label: "Settings", icon: Settings }
];
 
const AdjusterLayoutInner = () => {
  const navigate = useNavigate();
 
  // Get user from localStorage
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();
 
  const userName = storedUser.name || storedUser.username || storedUser.email || 'ADJUSTER';
  const userRole = storedUser.role || 'Claims Adjuster';
 
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };
 
  return (
    <DashboardShell
      navItems={ADJUSTER_NAV}
      logoSubtitle="Adjuster Portal"
      userName={userName}
      userRole={userRole}
      onLogout={handleLogout}
    />
  );
};
 
// Wrapping with Provider to keep notification logic intact if needed later
const AdjusterLayout = () => {
  return (
    <NotificationProvider>
      <AdjusterLayoutInner />
    </NotificationProvider>
  );
};
 
export default AdjusterLayout;