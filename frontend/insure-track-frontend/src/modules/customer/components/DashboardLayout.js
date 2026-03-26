import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate, Outlet } from 'react-router-dom';
import { 
    LayoutGrid, FileText, Activity, CreditCard, 
    Heart, Shield, UserCircle 
} from 'lucide-react';
import DashboardShell from '../../../core/components/DashboardShell';

const CustomerLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [isActivated, setIsActivated] = useState(
        localStorage.getItem("customerStatus") === "ACTIVE"
    );

    useEffect(() => {
        const checkStatus = () => {
            const status = localStorage.getItem("customerStatus");
            setIsActivated(status === "ACTIVE");
        };

        window.addEventListener('storage', checkStatus);
        const interval = setInterval(checkStatus, 1000);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', checkStatus);
        };
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // Define Navigation with "locked" property
    const CUSTOMER_NAV = [
        { path: 'overview', icon: LayoutGrid, label: 'Overview', locked: !isActivated },
        { path: 'policies', icon: FileText, label: 'Policies', locked: !isActivated },
        { path: 'claims', icon: Activity, label: 'Claims', locked: !isActivated },
        { path: 'payments', icon: CreditCard, label: 'Payments', locked: !isActivated },
        { path: 'beneficiaries', icon: Heart, label: 'Beneficiaries', locked: !isActivated },
        { path: 'insured-objects', icon: Shield, label: 'Insured Objects', locked: !isActivated },
        { path: 'Coverages', icon: Shield, label: 'Coverages', locked: !isActivated },
        { path: 'Quotes', icon: Shield, label: 'Quotes', locked: !isActivated },
        { path: 'my-profile', icon: UserCircle, label: 'Profile Settings', locked: false },
    ];

    // Security: If not activated and not on profile page, redirect
    if (!isActivated && !location.pathname.includes('my-profile')) {
        return <Navigate to="/customer-dashboard/my-profile" replace />;
    }

    return (
        <DashboardShell
            navItems={CUSTOMER_NAV}
            logoSubtitle="Customer Portal"
            userName={localStorage.getItem("userName") || 'Customer'}
            userRole={isActivated ? 'ACTIVE' : 'INCOMPLETE'}
            onLogout={handleLogout}
        >
            <Outlet />
        </DashboardShell>
    );
};

export default CustomerLayout;