import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid, FileText, Shield, RefreshCw,
  Calendar, XCircle, Users, Clipboard, Bell
} from 'lucide-react';
import CreateQuoteModal from './components/CreateQuoteModal';
import DashboardShell from '../../core/components/DashboardShell';

const NAV = [
  { path: "", icon: LayoutGrid, label: 'Dashboard', end: true },
  { path: "quotes", icon: FileText, label: 'Quotes' },
  { path: 'policies', icon: Shield, label: 'Policies' },
  { path: 'endorsements', icon: RefreshCw, label: 'Endorsements' },
  { path: 'renewals', icon: Calendar, label: 'Renewals' },
  { path: 'cancellations', icon: XCircle, label: 'Cancellations' },
  { path: 'customers', icon: Users, label: 'Customers' },
  { path: 'claims', icon: Clipboard, label: 'Claims' },
  { path: 'notifications', icon: Bell, label: 'Notifications' },
];

const AgentLayout = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();

  const userName = storedUser.name || storedUser.username || storedUser.email || 'Agent';
  const userRole = storedUser.role || 'Insurance Agent';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const createQuoteAction = (
    <button
      className="it-btn it-btn-accent it-btn-sm"
      onClick={() => setIsModalOpen(true)}
    >
      + Create Quote
    </button>
  );

  return (
    <>
      <DashboardShell
        navItems={NAV}
        logoSubtitle="Agent Portal"
        userName={userName}
        userRole={userRole}
        onLogout={handleLogout}
        extraHeaderActions={createQuoteAction}
      />

      <CreateQuoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
export default AgentLayout;