import React, { useEffect, useState } from 'react';

const ClaimsDashboard = () => {
  const [claims, setClaims]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('ALL');
  const [selectedClaim, setSelectedClaim] = useState(null);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await fetch('http://localhost:8082/api/adjuster/claims/all', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch claims');
        const data = await response.json();
        setClaims(data);
      } catch (error) {
        console.error('Error fetching claims:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, []);

  const totalClaims  = claims.length;
  const approved     = claims.filter(c => ['ADJUDICATED','SETTLED'].includes(c.status)).length;
  const underReview  = claims.filter(c => c.status === 'INVESTIGATING').length;
  const denied       = claims.filter(c => c.status === 'DENIED').length;

  const filtered = filter === 'ALL' ? claims : claims.filter(c => c.status === filter);

  const statusBadgeClass = (status) => {
    if (['ADJUDICATED','SETTLED'].includes(status)) return 'it-badge it-badge-success';
    if (status === 'DENIED')                        return 'it-badge it-badge-danger';
    if (status === 'INVESTIGATING')                 return 'it-badge it-badge-warning';
    return 'it-badge it-badge-info';
  };

  return (
    <div className="it-page">
      <div className="it-page-header">
        <h1 className="it-page-title">Claims Analytics</h1>
        <p className="it-page-subtitle">Track and manage all insurance claims</p>
      </div>

      {/* KPI Stats */}
      <div className="it-stat-grid">
        {[
          { label: 'Total Claims',       value: totalClaims, color: '#EFF6FF', ic: '#1E3A8A' },
          { label: 'Approved / Settled', value: approved,    color: '#F0FDF4', ic: '#16A34A' },
          { label: 'Under Review',       value: underReview, color: '#FEF3C7', ic: '#B45309' },
          { label: 'Denied',             value: denied,      color: '#FEE2E2', ic: '#DC2626' },
        ].map(s => (
          <div key={s.label} className="it-stat-card">
            <div>
              <p className="it-stat-label">{s.label}</p>
              <p className="it-stat-value">{s.value}</p>
            </div>
            <div className="it-stat-icon" style={{ background: s.color }}>
              <span style={{ fontSize: 20, color: s.ic, fontWeight: 800 }}>{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['ALL','ADJUDICATED','INVESTIGATING','DENIED','SETTLED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`it-btn it-btn-sm ${filter === f ? 'it-btn-primary' : 'it-btn-secondary'}`}
          >
            {f === 'ALL' ? `All (${claims.length})` : `${f} (${claims.filter(c => c.status === f).length})`}
          </button>
        ))}
        <button className="it-btn it-btn-secondary it-btn-sm" style={{ marginLeft: 'auto' }} onClick={() => window.print()}>
          🖨 Print
        </button>
      </div>

      {/* Table */}
      <div className="it-table-wrapper">
        {loading ? (
          <div className="it-empty-state"><p>Loading claims…</p></div>
        ) : filtered.length === 0 ? (
          <div className="it-empty-state"><p>No claims found for this filter.</p></div>
        ) : (
          <table className="it-table">
            <thead>
              <tr>
                <th>Claim ID</th><th>Customer</th><th>Policy</th><th>Type</th>
                <th>Amount</th><th>Submitted</th><th>Processed</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(claim => (
                <tr key={claim.claimId}>
                  <td>#{claim.claimId}</td>
                  <td>{claim.customerName}</td>
                  <td>{claim.policyId}</td>
                  <td>{claim.claimType}</td>
                  <td>${claim.amount?.toLocaleString()}</td>
                  <td>{claim.reportedDate}</td>
                  <td>{claim.processedDate || '—'}</td>
                  <td><span className={statusBadgeClass(claim.status)}>{claim.status}</span></td>
                  <td>
                    <button className="it-btn it-btn-secondary it-btn-sm" onClick={() => setSelectedClaim(claim)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Details Modal */}
      {selectedClaim && (
        <div className="it-modal-overlay" onClick={() => setSelectedClaim(null)}>
          <div className="it-modal" onClick={e => e.stopPropagation()}>
            <div className="it-modal-header">
              <h2 className="it-modal-title">Claim #{selectedClaim.claimId}</h2>
              <button className="it-btn it-btn-ghost" onClick={() => setSelectedClaim(null)}>✕</button>
            </div>
            {[
              ['Customer',    selectedClaim.customerName],
              ['Policy',      selectedClaim.policyId],
              ['Type',        selectedClaim.claimType],
              ['Amount',      `$${selectedClaim.amount}`],
              ['Submitted',   selectedClaim.reportedDate],
              ['Processed',   selectedClaim.processedDate || '—'],
              ['Status',      selectedClaim.status],
              ['Description', selectedClaim.description],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--it-border)' }}>
                <span style={{ fontWeight: 600, color: 'var(--it-text-secondary)', fontSize: '14px' }}>{k}</span>
                <span style={{ color: 'var(--it-text-primary)', fontSize: '14px', textAlign: 'right', maxWidth: '60%' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimsDashboard;
