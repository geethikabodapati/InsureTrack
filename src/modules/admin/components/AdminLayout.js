import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import '../../../styles/DashboardLayout.css'; 
import { 
    Box, 
    ShieldCheck, 
    Users, 
    LogOut, 
    Calculator, 
    History, 
    Settings, 
    Circle 
} from 'lucide-react';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Initial state set to empty
    const [user, setUser] = useState({
        name: '',
        email: '',
        initial: ''
    });

    useEffect(() => {
        const storedUserData = localStorage.getItem("user");
        
        if (storedUserData) {
            try {
                const userData = JSON.parse(storedUserData);
                
                // Mapping backend response keys
                const displayName = userData.name || userData.username || userData.email || 'Admin User';
                const displayEmail = userData.email || 'No Email Provided';
                
                setUser({
                    name: displayName,
                    email: displayEmail,
                    initial: displayName.charAt(0).toUpperCase()
                });
            } catch (error) {
                console.error("Error parsing user data:", error);
                navigate("/login");
            }
        } else {
            navigate("/login");
        }
    }, [navigate]);

    const menuItems = [
        { name: 'Products', path: '/admin-products', icon: <Box size={20}/> },
        { name: 'Coverages', path: '/admin-coverages', icon: <ShieldCheck size={20}/> },
        { name: 'Rating Rules', path: '/admin-rules', icon: <Calculator size={20}/> }, 
        { name: 'Users', path: '/admin-users', icon: <Users size={20}/> },
        { name: 'Audit Logs', path: '/admin-logs', icon: <History size={20}/> },
        { name: 'Settings', path: '/admin-settings', icon: <Settings size={20}/> }
    ];

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="admin-container">
            <aside className="sidebar">
                <Link to="/admin-dashboard" className="sidebar-header" style={{ textDecoration: 'none' }}>
                    <div className="logo-section" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ShieldCheck size={32} color="#fff" />
                        <div>
                            <h1 style={{ fontSize: '1.2rem', margin: 0, color: 'white' }}>InsureTrack</h1>
                            <p style={{ fontSize: '0.7rem', opacity: 0.7, margin: 0, color: 'white' }}>Management Portal</p>
                        </div>
                    </div>
                </Link>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <Link 
                            key={item.path} 
                            to={item.path} 
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            {item.icon} <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={20}/> <span>Logout</span>
                </button>
            </aside>

            <div className="main-content">
                <header className="top-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 30px' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                        {menuItems.find(m => m.path === location.pathname)?.name || 'Dashboard'}
                    </h2>
                    
                    <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {/* Notification Bell Link Removed */}
                        
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                                {user.name}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px' }}>
                                <Circle size={8} fill="#22c55e" color="#22c55e" />
                                <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: 'bold' }}>ONLINE</span>
                            </div>
                        </div>

                        <div className="avatar" style={{ position: 'relative' }}>
                            {user.initial}
                            <div style={{ 
                                position: 'absolute', 
                                bottom: '0', 
                                right: '0', 
                                width: '10px', 
                                height: '10px', 
                                background: '#22c55e', 
                                border: '2px solid white', 
                                borderRadius: '50%' 
                            }}></div>
                        </div>
                    </div>
                </header>

                <main className="page-body">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;