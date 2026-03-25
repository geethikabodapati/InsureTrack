import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, CreditCard, RotateCcw, BarChart3
} from 'lucide-react';
import DashboardShell from '../../core/components/DashboardShell';
 
const NAV = [
  { path: 'analyst-dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
  { path: 'billing', icon: FileText, label: 'Billing' },
  { path: 'payments', icon: CreditCard, label: 'Payments' },
  { path: 'claims', icon: BarChart3, label: 'Claims' },
  { path: 'refunds', icon: RotateCcw, label: 'Refunds' },
];
 
const AnalystLayout = () => {
  const navigate = useNavigate();
 
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();
  const userName = storedUser.name || storedUser.username || storedUser.email || 'Analyst';
  const userRole = storedUser.role || 'Finance & Compliance Analyst';
 
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
  }, [navigate]);
 
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };
 
  return (
    <DashboardShell
      navItems={NAV}
      logoSubtitle="Analyst Portal"
      userName={userName}
      userRole={userRole}
      onLogout={handleLogout}
    />
  );
};
 
export default AnalystLayout;