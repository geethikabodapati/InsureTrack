// // src/modules/agent/components/AgentSidebar.jsx
// import React from 'react';
// import { NavLink } from 'react-router-dom';
// import {
//     FiGrid, FiFileText, FiShield, FiRepeat,
//     FiCalendar, FiXCircle, FiUsers, FiClipboard, FiBell, FiSettings
// } from 'react-icons/fi';
// import '../styles/agentLayout.css';

// const AgentSidebar = () => {
//     const navItems = [
//         { name: 'Dashboard', icon: <FiGrid />, path: 'dashboard' },
//         { name: 'Quotes', icon: <FiFileText />, path: 'quotes' },
//         { name: 'Policies', icon: <FiShield />, path: 'policies' },
//         { name: 'Endorsements', icon: <FiRepeat />, path: 'endorsements' },
//         { name: 'Renewals', icon: <FiCalendar />, path: 'renewals' },
//         { name: 'Cancellations', icon: <FiXCircle />, path: 'cancellations' },
//         { name: 'Customers', icon: <FiUsers />, path: 'customers' },
//         { name: 'Claims', icon: <FiClipboard />, path: 'claims' },
//         { name: 'Notifications', icon: <FiBell />, path: 'notifications' },
//         // { name: 'Settings', icon: <FiSettings />, path: '/agent/settings' },
//     ];

//     return (
//         <aside className="agent-sidebar">
//             <div className="sidebar-logo">
//                 <div className="logo-icon">
//                     <FiShield />
//                 </div>
//                 <div className="logo-text">
//                     <h1>Insure Track</h1>
//                     <p>Agent Dashboard</p>
//                 </div>
//             </div>

//             <nav className="sidebar-menu">
//                 {navItems.map((item, index) => (
//                     <NavLink
//                         key={index}
//                         to={item.path}
//                         className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}
//                     >
//                         <span className="icon">{item.icon}</span>
//                         <span className="label">{item.name}</span>
//                     </NavLink>
//                 ))}
//             </nav>

//             <div className="sidebar-footer">
//                 <p>© 2026 Insure Track</p>
//                 <span>v1.0.0</span>
//             </div>
//         </aside>
//     );
// };

// export default AgentSidebar;