import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, Shield, LogOut, Bell, Sun, Moon, ChevronDown } from 'lucide-react';
import './DashboardShell.css';

/**
 * DashboardShell — Universal layout used by all role dashboards.
 *
 * Props:
 *  - navItems: [{path, label, icon: LucideComponent, end?}]
 *  - logoSubtitle: string (e.g. "Admin Portal")
 *  - userName: string
 *  - userRole: string
 *  - onLogout: function
 *  - extraHeaderActions: ReactNode (optional)
 *  - children: ReactNode (optional override for <Outlet>)
 */
const DashboardShell = ({
  navItems = [],
  logoSubtitle = 'Management Portal',
  userName = '',
  userRole = '',
  onLogout,
  extraHeaderActions = null,
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode]   = useState(() => {
    return localStorage.getItem('it-dark-mode') === 'true';
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  const userInitial = userName ? userName.charAt(0).toUpperCase() : '?';
  const displayName = userName || 'User';

  // Apply / remove dark class on body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('it-dark-mode', darkMode);
  }, [darkMode]);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="it-shell">
      {/* ─── Sidebar ─────────────────────────────────────────── */}
      <aside className={`it-sidebar${collapsed ? ' collapsed' : ''}`}>
        {/* Brand */}
        <div className="it-sidebar-brand">
          <div className="it-brand-icon">
            <Shield size={18} />
          </div>
          {!collapsed && (
            <div className="it-brand-text">
              <span className="it-brand-name">InsureTrack</span>
              <span className="it-brand-tagline">{logoSubtitle}</span>
            </div>
          )}
        </div>

        {/* Nav Links */}
        <nav className="it-sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `it-nav-link${isActive ? ' active' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <span className="it-nav-icon">
                  <Icon size={18} />
                </span>
                {!collapsed && (
                  <span className="it-nav-label">{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="it-sidebar-footer">
          <button className="it-logout-btn" onClick={onLogout}>
            <span className="it-nav-icon">
              <LogOut size={18} />
            </span>
            {!collapsed && <span className="it-nav-label">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ─── Main Area ───────────────────────────────────────── */}
      <div className="it-main">
        {/* Header */}
        <header className="it-header">
          <div className="it-header-left">
            {/* Collapse toggle */}
            <button
              className="it-collapse-btn"
              onClick={() => setCollapsed(!collapsed)}
              aria-label="Toggle sidebar"
            >
              {collapsed ? <Menu size={16} /> : <X size={16} />}
            </button>
            <div>
              <p className="it-page-name">InsureTrack</p>
              <p className="it-breadcrumb">{logoSubtitle}</p>
            </div>
          </div>

          <div className="it-header-right">
            {/* Slot for role-specific actions (e.g. notification bell with count) */}
            {extraHeaderActions}

            {/* Dark mode toggle */}
            <button
              className="it-icon-btn"
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle dark mode"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="it-header-sep" />

            {/* User chip with dropdown */}
            <div
              className="it-user-chip"
              ref={userMenuRef}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setUserMenuOpen(!userMenuOpen)}
            >
              <div className="it-user-info">
                <span className="it-user-name">{displayName}</span>
                {userRole && (
                  <span className="it-user-role">{userRole}</span>
                )}
              </div>
              <div className="it-avatar">
                {userInitial}
                <div className="it-online-dot" />
              </div>
              <ChevronDown size={14} className={`it-chevron${userMenuOpen ? ' open' : ''}`} />

              {/* Dropdown */}
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
                  <button
                    className="it-dropdown-item it-dropdown-item-danger"
                    onClick={() => { setUserMenuOpen(false); onLogout && onLogout(); }}
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="it-content">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default DashboardShell;
