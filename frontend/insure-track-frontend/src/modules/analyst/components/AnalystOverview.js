import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CreditCard, BarChart3, RotateCcw, TrendingUp, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

const AnalystOverview = () => {
  const navigate = useNavigate();
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();
  const userName = storedUser.name || storedUser.email || 'Analyst';

  const quickLinks = [
    { label: 'Billing',  path: '/analyst/billing',  icon: FileText,   color: '#1E3A8A' },
    { label: 'Payments', path: '/analyst/payments', icon: CreditCard,  color: '#16A34A' },
    { label: 'Claims',   path: '/analyst/claims',   icon: BarChart3,   color: '#B45309' },
    { label: 'Refunds',  path: '/analyst/refunds',  icon: RotateCcw,   color: '#7C3AED' },
  ];

  return (
    <div className="it-page">
      <div className="it-page-header">
        <h1 className="it-page-title">Financial Overview</h1>
        <p className="it-page-subtitle">Welcome back, {userName}. Monitor billing, payments, claims and refunds.</p>
      </div>

      {/* Summary Stats */}
      <div className="it-stat-grid">
        {[
          { label: 'Total Revenue',    value: '$943K',   icon: DollarSign,    color: '#EFF6FF', ic: '#1E3A8A' },
          { label: 'Outstanding',      value: '$124K',   icon: AlertCircle,   color: '#FEF3C7', ic: '#B45309' },
          { label: 'Active Policies',  value: '2,847',   icon: TrendingUp,    color: '#F0FDF4', ic: '#16A34A' },
          { label: 'Payment Rate',     value: '94.2%',   icon: CheckCircle,   color: '#F0FDF4', ic: '#16A34A' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="it-stat-card">
              <div>
                <p className="it-stat-label">{s.label}</p>
                <p className="it-stat-value">{s.value}</p>
              </div>
              <div className="it-stat-icon" style={{ background: s.color }}>
                <Icon size={22} color={s.ic} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Navigation */}
      <div className="it-section">
        <h2 className="it-section-title">Modules</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          {quickLinks.map(link => {
            const Icon = link.icon;
            return (
              <button
                key={link.label}
                className="it-card"
                style={{ cursor: 'pointer', textAlign: 'left', border: '1px solid var(--it-border)', background: 'var(--it-bg-card)' }}
                onClick={() => navigate(link.path)}
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: `${link.color}18`, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', marginBottom: '12px',
                }}>
                  <Icon size={22} color={link.color} />
                </div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '15px', color: 'var(--it-text-primary)' }}>
                  {link.label}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--it-text-secondary)' }}>
                  View &rarr;
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnalystOverview;
