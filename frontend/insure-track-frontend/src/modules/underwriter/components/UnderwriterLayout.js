import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, ShieldCheck, BarChart3, Bell, Settings
} from 'lucide-react';
import DashboardShell from '../../../core/components/DashboardShell';

const NAV = [
  { path: '', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { path: 'cases', icon: FileText, label: 'Underwriting' },
  { path: 'lookup-case/:id', icon: ShieldCheck, label: 'LookUp' },
  { path: 'reports', icon: BarChart3, label: 'Reports' },
  { path: 'notifications', icon: Bell, label: 'Notifications' },
  { path: 'settings', icon: Settings, label: 'Settings' },
];

const UnderwriterLayout = () => {
  const navigate = useNavigate();

  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();
  const userName = storedUser.name || storedUser.fullName || storedUser.username || 'Underwriter';
  const userRole = storedUser.role || 'Risk Assessment Dept';

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
      logoSubtitle="Underwriting Portal"
      userName={userName}
      userRole={userRole}
      onLogout={handleLogout}
    />
  );
};

export default UnderwriterLayout;
