import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, Shield, LogOut, Sun, Moon, ChevronDown, Lock } from 'lucide-react'; // Added Lock
import './DashboardShell.css';

const DashboardShell = ({
  navItems = [],
  logoSubtitle = 'Management Portal',
  userName = '',
  userRole = '',
  onLogout,
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('it-dark-mode') === 'true');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const userInitial = userName ? userName.charAt(0).toUpperCase() : '?';
  const displayName = userName || 'User';

  useEffect(() => {
    darkMode ? document.body.classList.add('dark') : document.body.classList.remove('dark');
    localStorage.setItem('it-dark-mode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="it-shell">
      <aside className={`it-sidebar${collapsed ? ' collapsed' : ''}`}>
        <div className="it-sidebar-brand">
          <div className="it-brand-icon"><Shield size={18} /></div>
          {!collapsed && (
            <div className="it-brand-text">
              <span className="it-brand-name">InsureTrack</span>
              <span className="it-brand-tagline">{logoSubtitle}</span>
            </div>
          )}
        </div>

        <nav className="it-sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            // CHECK LOCK STATUS
            const isLocked = item.locked === true;

            return (
              <NavLink
                key={item.path}
                to={isLocked ? '#' : item.path} // Prevent navigation if locked
                end={item.end}
                className={({ isActive }) =>
                  `it-nav-link${isActive ? ' active' : ''}${isLocked ? 'it-nav-locked' : ''}`
                }
                title={isLocked ? "Complete profile to unlock" : (collapsed ? item.label : undefined)}
                onClick={(e) => isLocked && e.preventDefault()} // Hard stop for clicks
                style={isLocked ? { cursor: 'not-allowed', opacity: 0.6 } : {}}
              >
                <span className="it-nav-icon">
                  <Icon size={18} />
                </span>
                {!collapsed && (
                  <span className="it-nav-label" style={{ flex: 1 }}>
                    {item.label}
                  </span>
                )}
                {/* SHOW LOCK ICON IF LOCKED */}
                {!collapsed && isLocked && (
                  <Lock size={12} className="it-lock-icon" style={{ marginLeft: 'auto' }} />
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="it-main">
        <header className="it-header">
          <div className="it-header-left">
            <button className="it-collapse-btn" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? <Menu size={16} /> : <X size={16} />}
            </button>
            <div>
              <p className="it-page-name">InsureTrack</p>
              <p className="it-breadcrumb">{logoSubtitle}</p>
            </div>
          </div>

          <div className="it-header-right">
            <button className="it-icon-btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="it-header-sep" />
            <div className="it-user-chip" ref={userMenuRef} onClick={() => setUserMenuOpen(!userMenuOpen)}>
              <div className="it-user-info">
                <span className="it-user-name">{displayName}</span>
                {userRole && <span className="it-user-role">{userRole}</span>}
              </div>
              <div className="it-avatar">
                {userInitial}
                <div className="it-online-dot" />
              </div>
              <ChevronDown size={14} className={`it-chevron${userMenuOpen ? ' open' : ''}`} />
              {userMenuOpen && (
                <div className="it-user-dropdown" onClick={(e) => e.stopPropagation()}>
                  <div className="it-user-dropdown-header">
                    <div className="it-avatar it-avatar-lg">{userInitial}</div>
                    <div>
                      <p className="it-user-dropdown-name">{displayName}</p>
                      <p className="it-user-dropdown-role">{userRole}</p>
                    </div>
                  </div>
                  <hr className="it-dropdown-divider" />
                  <button className="it-dropdown-item" onClick={() => { setUserMenuOpen(false); onLogout && onLogout(); }}>
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="it-content">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default DashboardShell;