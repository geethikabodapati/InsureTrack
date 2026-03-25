import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from '../../../core/components/DashboardShell';
import {
    Box,
    ShieldCheck,
    Users,
    Calculator,
    History,
    Settings
} from 'lucide-react';

// Admin Sidebar Items
const ADMIN_NAV = [
    { path: "admin-dashboard", label: "Dashboard", icon: Box, end: true },
    { path: "admin-products", label: "Products", icon: Box },
    { path: "admin-coverages", label: "Coverages", icon: ShieldCheck },
    { path: "admin-rules", label: "Rating Rules", icon: Calculator },
    { path: "admin-users", label: "Users", icon: Users },
    { path: "admin-logs", label: "Audit Logs", icon: History },
    { path: "admin-settings", label: "Settings", icon: Settings }
];

const AdminLayout = () => {
    const navigate = useNavigate();

    // Get user from localStorage
    const storedUser = (() => {
        try { return JSON.parse(localStorage.getItem('user') || '{}'); }
        catch { return {}; }
    })();

    const userName = storedUser.name || storedUser.username || storedUser.email || 'Admin';
    const userRole = storedUser.role || 'Administrator';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <DashboardShell
            navItems={ADMIN_NAV}
            logoSubtitle="Admin Portal"
            userName={userName}
            userRole={userRole}
            onLogout={handleLogout}
        />
    );
};

export default AdminLayout;