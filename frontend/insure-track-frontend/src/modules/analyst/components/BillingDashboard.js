import React, { useEffect, useState } from 'react';

const BillingDashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch('http://localhost:8082/api/analyst/billing/invoices/all', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch invoices');
        const data = await response.json();
        setInvoices(data);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const totalBilled  = invoices.reduce((s, i) => s + i.amount, 0);
  const collected    = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.amount, 0);
  const outstanding  = totalBilled - collected;
  const overdue      = invoices.filter(i => i.status === 'OVERDUE').length;

  const filtered = filter === 'ALL' ? invoices : invoices.filter(i => i.status === filter);

  const statusBadgeClass = (status) => {
    if (status === 'PAID')      return 'it-badge it-badge-success';
    if (status === 'OVERDUE')   return 'it-badge it-badge-danger';
    if (status === 'CANCELLED') return 'it-badge it-badge-neutral';
    return 'it-badge it-badge-warning';
  };

  return (
    <div className="it-page">
      <div className="it-page-header">
        <h1 className="it-page-title">Billing</h1>
        <p className="it-page-subtitle">Monitor and manage all billing invoices</p>
      </div>

      {/* KPI Stats */}
      <div className="it-stat-grid">
        {[
          { label: 'Total Billed',  value: `$${totalBilled.toLocaleString()}`,   color: '#EFF6FF', ic: '#1E3A8A' },
          { label: 'Collected',     value: `$${collected.toLocaleString()}`,      color: '#F0FDF4', ic: '#16A34A' },
          { label: 'Outstanding',   value: `$${outstanding.toLocaleString()}`,    color: '#FEF3C7', ic: '#B45309' },
          { label: 'Overdue Items', value: overdue,                               color: '#FEE2E2', ic: '#DC2626' },
        ].map(s => (
          <div key={s.label} className="it-stat-card">
            <div>
              <p className="it-stat-label">{s.label}</p>
              <p className="it-stat-value">{s.value}</p>
            </div>
            <div className="it-stat-icon" style={{ background: s.color }}>
              <span style={{ fontSize: 20, color: s.ic }}>$</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs + Print */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['ALL','PAID','OPEN','OVERDUE','CANCELLED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`it-btn it-btn-sm ${filter === f ? 'it-btn-primary' : 'it-btn-secondary'}`}
          >
            {f === 'ALL' ? `All (${invoices.length})` : `${f} (${invoices.filter(i => i.status === f).length})`}
          </button>
        ))}
        <button className="it-btn it-btn-secondary it-btn-sm" style={{ marginLeft: 'auto' }} onClick={() => window.print()}>
          🖨 Print
        </button>
      </div>

      {/* Table */}
      <div className="it-table-wrapper">
        {loading ? (
          <div className="it-empty-state"><p>Loading invoices…</p></div>
        ) : filtered.length === 0 ? (
          <div className="it-empty-state"><p>No invoices found for this filter.</p></div>
        ) : (
          <table className="it-table">
            <thead>
              <tr>
                <th>Invoice ID</th><th>Policy ID</th><th>Customer</th>
                <th>Amount</th><th>Issue Date</th><th>Due Date</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => (
                <tr key={inv.invoiceId}>
                  <td>#{inv.invoiceId}</td>
                  <td>{inv.policyId}</td>
                  <td>{inv.customerName}</td>
                  <td>${inv.amount?.toLocaleString()}</td>
                  <td>{inv.issueDate}</td>
                  <td>{inv.dueDate}</td>
                  <td><span className={statusBadgeClass(inv.status)}>{inv.status}</span></td>
                  <td>
                    <button className="it-btn it-btn-secondary it-btn-sm" onClick={() => setSelectedInvoice(inv)}>
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
      {selectedInvoice && (
        <div className="it-modal-overlay" onClick={() => setSelectedInvoice(null)}>
          <div className="it-modal" onClick={e => e.stopPropagation()}>
            <div className="it-modal-header">
              <h2 className="it-modal-title">Invoice #{selectedInvoice.invoiceId}</h2>
              <button className="it-btn it-btn-ghost" onClick={() => setSelectedInvoice(null)}>✕</button>
            </div>
            {[
              ['Customer',   selectedInvoice.customerName],
              ['Policy ID',  selectedInvoice.policyId],
              ['Amount',     `$${selectedInvoice.amount}`],
              ['Issue Date', selectedInvoice.issueDate],
              ['Due Date',   selectedInvoice.dueDate],
              ['Status',     selectedInvoice.status],
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

export default BillingDashboard;
