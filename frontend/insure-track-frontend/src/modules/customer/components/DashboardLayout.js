import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    LayoutGrid, FileText, Activity, CreditCard, 
    Heart, Shield, UserCircle, FileSearch 
} from 'lucide-react';
import DashboardShell from '../../../core/components/DashboardShell';

const CustomerLayout = () => {
    const navigate = useNavigate();
    
    // --- Keep your existing Activation Logic ---
    const [isActivated, setIsActivated] = useState(
        localStorage.getItem("customerStatus") === "ACTIVE"
    );

    useEffect(() => {
        const checkStatus = () => {
            const status = localStorage.getItem("customerStatus");
            setIsActivated(status === "ACTIVE");
        };

        const interval = setInterval(checkStatus, 1000);
        window.addEventListener('storage', checkStatus);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', checkStatus);
        };
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // --- YOUR CUSTOMER ITEMS (Unchanged Labels & Icons) ---
    const CUSTOMER_NAV = [
        { path: 'overview', icon: LayoutGrid, label: 'Overview' },
        { path: 'policies', icon: FileText, label: 'Policies' },
        { path: 'claims', icon: Activity, label: 'Claims' },
        { path: 'payments', icon: CreditCard, label: 'Payments' },
        { path: 'beneficiaries', icon: Heart, label: 'Beneficiaries' },
        { path: 'insured-objects', icon: Shield, label: 'Insured Objects' },
        { path: 'Coverages', icon: Shield, label: 'Coverages' },
        { path: 'Quotes', icon: Shield, label: 'Quotes' },
        { path: 'my-profile', icon: UserCircle, label: 'Profile Settings' },
    ];

    // Data from localStorage for the Header
    const userName = localStorage.getItem("userName") || 'Customer';
    const userRole = isActivated ? 'ACTIVE' : 'INCOMPLETE';

    return (
        <DashboardShell
            navItems={CUSTOMER_NAV}
            logoSubtitle="Customer Portal"
            userName={userName}
            userRole={userRole}
            onLogout={handleLogout}
        />
    );
};

export default CustomerLayout;