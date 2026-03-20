import React, { useEffect, useState } from 'react';

const RefundsDashboard = () => {
  const [refunds, setRefunds]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [filter, setFilter]               = useState('ALL');
  const [selectedRefund, setSelectedRefund] = useState(null);

  useEffect(() => {
    const fetchRefunds = async () => {
      try {
        const response = await fetch('http://localhost:8082/api/analyst/billing/refunds/all', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch refunds');
        const data = await response.json();
        setRefunds(data);
      } catch (error) {
        console.error('Error fetching refunds:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRefunds();
  }, []);

  const totalRefunds = refunds.reduce((s, r) => s + r.amount, 0);
  const completed    = refunds.filter(r => r.status === 'COMPLETED').reduce((s, r) => s + r.amount, 0);
  const pending      = refunds.filter(r => r.status === 'PENDING').reduce((s, r) => s + r.amount, 0);
  const failed       = refunds.filter(r => r.status === 'FAILED').reduce((s, r) => s + r.amount, 0);

  const filtered = filter === 'ALL' ? refunds : refunds.filter(r => r.status === filter);

  const statusBadgeClass = (status) => {
    if (status === 'COMPLETED') return 'it-badge it-badge-success';
    if (status === 'FAILED')    return 'it-badge it-badge-danger';
    return 'it-badge it-badge-warning';
  };

  return (
    <div className="it-page">
      <div className="it-page-header">
        <h1 className="it-page-title">Refunds</h1>
        <p className="it-page-subtitle">Track and manage all refund requests</p>
      </div>

      {/* KPI Stats */}
      <div className="it-stat-grid">
        {[
          { label: 'Total Refunds', value: `$${totalRefunds.toLocaleString()}`, color: '#EFF6FF', ic: '#1E3A8A' },
          { label: 'Completed',     value: `$${completed.toLocaleString()}`,    color: '#F0FDF4', ic: '#16A34A' },
          { label: 'Pending',       value: `$${pending.toLocaleString()}`,      color: '#FEF3C7', ic: '#B45309' },
          { label: 'Failed',        value: `$${failed.toLocaleString()}`,       color: '#FEE2E2', ic: '#DC2626' },
        ].map(s => (
          <div key={s.label} className="it-stat-card">
            <div>
              <p className="it-stat-label">{s.label}</p>
              <p className="it-stat-value">{s.value}</p>
            </div>
            <div className="it-stat-icon" style={{ background: s.color }}>
              <span style={{ fontSize: 18, color: s.ic, fontWeight: 800 }}>↩</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['ALL','COMPLETED','PENDING','FAILED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`it-btn it-btn-sm ${filter === f ? 'it-btn-primary' : 'it-btn-secondary'}`}
          >
            {f === 'ALL' ? `All (${refunds.length})` : `${f} (${refunds.filter(r => r.status === f).length})`}
          </button>
        ))}
        <button className="it-btn it-btn-secondary it-btn-sm" style={{ marginLeft: 'auto' }} onClick={() => window.print()}>
          🖨 Print
        </button>
      </div>

      {/* Table */}
      <div className="it-table-wrapper">
        {loading ? (
          <div className="it-empty-state"><p>Loading refunds…</p></div>
        ) : filtered.length === 0 ? (
          <div className="it-empty-state"><p>No refunds found for this filter.</p></div>
        ) : (
          <table className="it-table">
            <thead>
              <tr>
                <th>Refund ID</th><th>Payment ID</th><th>Customer</th>
                <th>Amount</th><th>Refund Date</th><th>Reason</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(refund => (
                <tr key={refund.refundId}>
                  <td>#{refund.refundId}</td>
                  <td>{refund.paymentId}</td>
                  <td>{refund.customerName}</td>
                  <td>${refund.amount?.toLocaleString()}</td>
                  <td>{refund.refundDate}</td>
                  <td>{refund.reason}</td>
                  <td><span className={statusBadgeClass(refund.status)}>{refund.status}</span></td>
                  <td>
                    <button className="it-btn it-btn-secondary it-btn-sm" onClick={() => setSelectedRefund(refund)}>
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
      {selectedRefund && (
        <div className="it-modal-overlay" onClick={() => setSelectedRefund(null)}>
          <div className="it-modal" onClick={e => e.stopPropagation()}>
            <div className="it-modal-header">
              <h2 className="it-modal-title">Refund #{selectedRefund.refundId}</h2>
              <button className="it-btn it-btn-ghost" onClick={() => setSelectedRefund(null)}>✕</button>
            </div>
            {[
              ['Customer',    selectedRefund.customerName],
              ['Payment ID',  selectedRefund.paymentId],
              ['Amount',      `$${selectedRefund.amount}`],
              ['Refund Date', selectedRefund.refundDate],
              ['Reason',      selectedRefund.reason],
              ['Status',      selectedRefund.status],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--it-border)' }}>
                <span style={{ fontWeight: 600, color: 'var(--it-text-secondary)', fontSize: '14px' }}>{k}</span>
                <span style={{ color: 'var(--it-text-primary)', fontSize: '14px' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundsDashboard;
