// import React from 'react';
// import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
// import { 
//   LayoutDashboard, 
//   FileText, 
//   ShieldCheck, 
//   BarChart3, 
//   Bell, 
//   Settings, 
//   Search, 
//   LogOut,
//   User
// } from 'lucide-react'; 
// import '../styles/underwriter.css';

// const Layout = () => {
//   const navigate = useNavigate();
//   const user = JSON.parse(localStorage.getItem("user"));

//   const menuItems = [
//     { name: 'Dashboard', path: '/underwriter-dashboard', icon: <LayoutDashboard size={20} /> },
//     { name: 'Underwriting Cases', path: 'cases', icon: <FileText size={20} /> },
//     { name: 'Risk Assessment', path: 'risk-assessment/:id', icon: <ShieldCheck size={20} /> },
//     { name: 'Reports', path: 'reports', icon: <BarChart3 size={20} /> },
//     { name: 'Notifications', path: 'notifications', icon: <Bell size={20} /> },
//     { name: 'Settings', path: 'settings', icon: <Settings size={20} /> }
//   ];

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("role");
//     localStorage.removeItem("user");
//     navigate("/login");
//   };

//   // Helper to get initials from name
//   const getInitials = (name) => {
//     if (!name) return "U";
//     return name.split(" ").map(n => n[0]).join("").toUpperCase();
//   };

//   return (
//     <div className="dashboard-container">
//       {/* Sidebar */}
//       <aside className="sidebar">
//         <div className="sidebar-top">
//           <div className="sidebar-logo">
//             <ShieldCheck className="logo-icon" size={28} color="#3b82f6" />
//             <div className="logo-text-group">
//               <span className="logo-text">InsureTrack</span>
//               <span className="logo-subtext">Underwriting Portal</span>
//             </div>
//           </div>
//           <nav className="sidebar-nav">
//             {menuItems.map((item) => (
//               <NavLink 
//                 key={item.name} 
//                 to={item.path} 
//                 className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
//               >
//                 <span className="nav-icon">{item.icon}</span>
//                 {item.name}
//               </NavLink>
//             ))}
//           </nav>
//         </div>

//         {/* User Profile Section */}
//         <div className="sidebar-footer">
//           <div className="user-avatar-small">
//             {getInitials(user?.fullName || "John Doe")}
//           </div>
//           <div className="user-info-text">
//             <span className="user-name">{user?.name || "Demo"}</span>
//             <span className="user-role">{user?.role || "Demo Underwriter"}</span>
//           </div>
//         </div>
//       </aside>

//       {/* Main Area */}
//       <main className="main-content">
//         <header className="top-nav">
//           <div className="search-bar">
//             <Search className="search-icon-lucide" size={18} />
//             <input type="text" placeholder="Search cases, customers, policies..." />
//           </div>
          
//           <div className="top-nav-actions">
//             <Link to="notifications" className="icon-link-btn">
//               <div className="notification-wrapper">
//                 <Bell size={20} />
//                 <span className="badge-dot"></span>
//               </div>
//             </Link>
            
//             <button onClick={handleLogout} className="logout-btn">
//               <LogOut size={18} />
//               <span>Logout</span>
//             </button>
//           </div>
//         </header>
        
//         <div className="page-wrapper">
//           <Outlet /> 
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Layout;
import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, ShieldCheck, BarChart3, 
  Bell, Settings, Search, LogOut, Sun, Moon 
} from 'lucide-react'; 
import '../../../styles/DashboardLayout.css';

const Layout = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Checking localStorage for user data
  const userData = JSON.parse(localStorage.getItem("user"));
  const userName = userData?.fullName || userData?.name || "Underwriter";
  const userRole = userData?.role || "Risk Assessment Dept";

  const menuItems = [
    { name: 'Dashboard', path: '/underwriter-dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Underwriting Cases', path: 'cases', icon: <FileText size={20} /> },
    { name: 'Risk Assessment', path: 'risk-assessment/:id', icon: <ShieldCheck size={20} /> },
    { name: 'Reports', path: 'reports', icon: <BarChart3 size={20} /> },
    { name: 'Notifications', path: 'notifications', icon: <Bell size={20} /> },
    { name: 'Settings', path: 'settings', icon: <Settings size={20} /> }
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className={`dashboard-shell ${isDarkMode ? 'dark-theme' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon-bg"><ShieldCheck size={22} /></div>
          <div className="logo-text">
            <h1>InsureTrack</h1>
            <p>Underwriting Portal</p>
          </div>
        </div>
        
        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <NavLink key={item.name} to={item.path} className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}>
              {item.icon} <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="menu-item" style={{width: '100%', border:'none', background:'none', cursor:'pointer', color:'#F04438'}}>
            <LogOut size={20} /> <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="content-area">
        <header className="main-navbar">
          <div className="search-container">
            <Search className="search-icon" size={18} />
            <input type="text" className="nav-search-input" placeholder="Search cases or policies..." />
          </div>

          <div className="nav-actions">
            <button className="icon-btn" onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="icon-btn" onClick={() => navigate('notifications')}>
              <Bell size={20} />
            </button>
            
            <div className="user-profile-nav">
              <div className="user-info-text">
                <span className="user-name">{userName}</span>
                <span className="user-role">{userRole}</span>
              </div>
              <div className="user-avatar">
                {userName.charAt(0).toUpperCase()}
                <div className="online-dot"></div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="scrollable-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;