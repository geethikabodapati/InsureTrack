import React, { useEffect, useState } from 'react';
 
const PaymentsDashboard = () => {
  const [payments, setPayments]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [filter, setFilter]                 = useState('ALL');
  const [selectedPayment, setSelectedPayment] = useState(null);
 
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch('http://localhost:8082/api/analyst/billing/payments/all', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch payments');
        const data = await response.json();
        setPayments(data);
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);
 
  const totalPayments = payments.reduce((s, p) => s + p.amount, 0);
  const completed     = payments.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + p.amount, 0);
  const pending       = payments.filter(p => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0);
  const failed        = payments.filter(p => p.status === 'FAILED').reduce((s, p) => s + p.amount, 0);
 
  const filtered = filter === 'ALL' ? payments : payments.filter(p => p.status === filter);
 
  const statusBadgeClass = (status) => {
    if (status === 'COMPLETED') return 'it-badge it-badge-success';
    if (status === 'FAILED')    return 'it-badge it-badge-danger';
    return 'it-badge it-badge-warning';
  };
 
  return (
    <div className="it-page">
      <div className="it-page-header">
        <h1 className="it-page-title">Payments</h1>
        <p className="it-page-subtitle">Track and manage all payment transactions</p>
      </div>
 
      {/* KPI Stats */}
      <div className="it-stat-grid">
        {[
          { label: 'Total Payments', value: `₹${totalPayments.toLocaleString()}`, color: '#EFF6FF', ic: '#1E3A8A' },
          { label: 'Completed',      value: `₹${completed.toLocaleString()}`,     color: '#F0FDF4', ic: '#16A34A' },
          { label: 'Pending',        value: `₹${pending.toLocaleString()}`,       color: '#FEF3C7', ic: '#B45309' },
          { label: 'Failed',         value: `₹${failed.toLocaleString()}`,        color: '#FEE2E2', ic: '#DC2626' },
        ].map(s => (
          <div key={s.label} className="it-stat-card">
            <div>
              <p className="it-stat-label">{s.label}</p>
              <p className="it-stat-value">{s.value}</p>
            </div>
            <div className="it-stat-icon" style={{ background: s.color }}>
              <span style={{ fontSize: 18, color: s.ic, fontWeight: 800 }}>$</span>
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
            {f === 'ALL' ? `All (${payments.length})` : `${f} (${payments.filter(p => p.status === f).length})`}
          </button>
        ))}
        <button className="it-btn it-btn-secondary it-btn-sm" style={{ marginLeft: 'auto' }} onClick={() => window.print()}>
          🖨 Print
        </button>
      </div>
 
      {/* Table */}
      <div className="it-table-wrapper">
        {loading ? (
          <div className="it-empty-state"><p>Loading payments…</p></div>
        ) : filtered.length === 0 ? (
          <div className="it-empty-state"><p>No payments found for this filter.</p></div>
        ) : (
          <table className="it-table">
            <thead>
              <tr>
                <th>Payment ID</th><th>Invoice ID</th><th>Customer</th>
                <th>Amount</th><th>Paid Date</th><th>Method</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(pay => (
                <tr key={pay.paymentId}>
                  <td>#{pay.paymentId}</td>
                  <td>{pay.invoiceId}</td>
                  <td>{pay.customerName}</td>
                  <td>₹{pay.amount?.toLocaleString()}</td>
                  <td>{pay.paidDate}</td>
                  <td>{pay.method}</td>
                  <td><span className={statusBadgeClass(pay.status)}>{pay.status}</span></td>
                  <td>
                    <button className="it-btn it-btn-secondary it-btn-sm" onClick={() => setSelectedPayment(pay)}>
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
      {selectedPayment && (
        <div className="it-modal-overlay" onClick={() => setSelectedPayment(null)}>
          <div className="it-modal" onClick={e => e.stopPropagation()}>
            <div className="it-modal-header">
              <h2 className="it-modal-title">Payment #{selectedPayment.paymentId}</h2>
              <button className="it-btn it-btn-ghost" onClick={() => setSelectedPayment(null)}>✕</button>
            </div>
            {[
              ['Customer',  selectedPayment.customerName],
              ['Invoice',   selectedPayment.invoiceId],
              ['Amount',    `$${selectedPayment.amount}`],
              ['Paid Date', selectedPayment.paidDate],
              ['Method',    selectedPayment.method],
              ['Status',    selectedPayment.status],
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
 
export default PaymentsDashboard;