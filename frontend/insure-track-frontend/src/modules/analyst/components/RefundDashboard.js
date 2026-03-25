import React, { useEffect, useState } from 'react';
import { RotateCcw, CheckCircle, AlertCircle, Printer, ShieldAlert, FileEdit, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
 
// Improved helper function to map Backend reasons to UI Scenarios
const getRefundType = (reason = "") => {
  const r = reason ? reason.toLowerCase() : "";
  if (r.includes('cancellation')) {
    return {
      label: 'Policy Cancellation',
      color: '#DC2626',
      bg: '#FEF2F2',
      icon: <ShieldAlert size={14} />,
      description: 'Full/Partial Pro-rata return'
    };
  }
  if (r.includes('endorsement')) {
    return {
      label: 'Endorsement Change',
      color: '#2563EB',
      bg: '#DBEAFE',
      icon: <FileEdit size={14} />,
      description: 'Premium reduction adjustment'
    };
  }
  return {
    label: 'Manual Adjustment',
    color: '#4B5563',
    bg: '#F3F4F6',
    icon: <HelpCircle size={14} />,
    description: 'General billing fix'
  };
};
 
const RefundsDashboard = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedRefund, setSelectedRefund] = useState(null);
 
  // --- NEW PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
 
  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8082/api/analyst/billing/refunds/all', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
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
 
  useEffect(() => {
    fetchRefunds();
  }, []);
 
  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);
 
  const handleProcessRefund = async (refundId) => {
    if (!window.confirm(`Confirm disbursement for Refund #REF-${refundId}?`)) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8082/api/analyst/billing/refunds/${refundId}/process`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
 
      if (response.ok) {
        alert("Refund Disbursed Successfully!");
        fetchRefunds();
      } else {
        alert("Failed to process refund. Check backend logs.");
      }
    } catch (error) {
      alert("Network error: Could not connect to the server.");
    }
  };
 
  const totalAmount = refunds.reduce((s, r) => s + (r.amount || 0), 0);
  const initiatedCount = refunds.filter(r => r.status === 'INITIATED').length;
  const failedCount = refunds.filter(r => r.status === 'FAILED').length;
 
  // Logic for Filtering and then Slicing for Pagination
  const filtered = filter === 'ALL' ? refunds : refunds.filter(r => r.status === filter);
 
  // --- PAGINATION CALCULATION ---
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filtered.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filtered.length / recordsPerPage);
 
  const getStatusStyle = (status) => {
    if (status === 'COMPLETED') return { bg: '#DCFCE7', text: '#166534', icon: <CheckCircle size={14} /> };
    if (status === 'FAILED') return { bg: '#FEE2E2', text: '#991B1B', icon: <AlertCircle size={14} /> };
    return { bg: '#FEF3C7', text: '#92400E', icon: <RotateCcw size={14} /> };
  };
 
  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Refund Data...</div>;
 
  return (
    <div className="it-page" style={{ padding: '30px', fontFamily: 'Inter, sans-serif', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
      <div className="it-page-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', margin: 0, color: '#111827' }}>Refund Management</h1>
          <p style={{ color: '#6B7280', marginTop: '4px' }}>
            Processing returns for <span style={{color: '#2563EB', fontWeight: 600}}>Endorsements</span> and <span style={{color: '#EF4444', fontWeight: 600}}>Cancellations</span>.
          </p>
        </div>
        <button
          className="it-btn it-btn-secondary"
          onClick={() => window.print()}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', cursor: 'pointer', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', fontWeight: '600', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
        >
          <Printer size={18} /> Print Audit Log
        </button>
      </div>
 
      <div className="it-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', background: '#fff', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
          <p style={{ color: '#6B7280', fontSize: '13px', margin: '0 0 5px 0', fontWeight: '500' }}>Total Refund Volume</p>
          <p style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: '#111827' }}>₹{totalAmount.toLocaleString()}</p>
        </div>
        <div style={{ padding: '20px', background: '#FFFBEB', borderRadius: '10px', border: '1px solid #FEF3C7' }}>
          <p style={{ color: '#92400E', fontSize: '13px', margin: '0 0 5px 0', fontWeight: '500' }}>Pending Disbursement</p>
          <p style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: '#B45309' }}>{initiatedCount}</p>
        </div>
        <div style={{ padding: '20px', background: '#FEF2F2', borderRadius: '10px', border: '1px solid #FEE2E2' }}>
          <p style={{ color: '#991B1B', fontSize: '13px', margin: '0 0 5px 0', fontWeight: '500' }}>System Failures</p>
          <p style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: '#DC2626' }}>{failedCount}</p>
        </div>
        <div style={{ padding: '20px', background: '#fff', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
          <p style={{ color: '#6B7280', fontSize: '13px', margin: '0 0 5px 0', fontWeight: '500' }}>Success Rate</p>
          <p style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>{refunds.length > 0 ? Math.round((refunds.filter(r=>r.status === 'COMPLETED').length / refunds.length) * 100) : 0}%</p>
        </div>
      </div>
 
      <div style={{ marginBottom: '25px', borderBottom: '1px solid #E5E7EB', display: 'flex', gap: '30px' }}>
        {['ALL', 'INITIATED', 'FAILED', 'COMPLETED'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '12px 8px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '14px', color: filter === f ? '#2563EB' : '#9CA3AF', borderBottom: filter === f ? '3px solid #2563EB' : '3px solid transparent', transition: 'all 0.2s' }}>
            {f}
          </button>
        ))}
      </div>
 
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <th style={{ padding: '18px', color: '#4B5563', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reference</th>
              <th style={{ color: '#4B5563', fontSize: '12px', textTransform: 'uppercase' }}>Customer Details</th>
              <th style={{ color: '#4B5563', fontSize: '12px', textTransform: 'uppercase' }}>Origin & Reason</th>
              <th style={{ color: '#4B5563', fontSize: '12px', textTransform: 'uppercase' }}>Amount</th>
              <th style={{ color: '#4B5563', fontSize: '12px', textTransform: 'uppercase' }}>Status</th>
              <th style={{ textAlign: 'right', paddingRight: '20px', color: '#4B5563', fontSize: '12px', textTransform: 'uppercase' }}>Operations</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>No refund records matching the current filter.</td></tr>
            ) : (
              currentRecords.map(r => {
                const statusStyle = getStatusStyle(r.status);
                const type = getRefundType(r.reason);
                return (
                  <tr key={r.refundId} style={{ borderBottom: '1px solid #F3F4F6', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FBFBFF'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '18px' }}>
                      <div style={{ fontWeight: '700', color: '#111827' }}>#REF-{r.refundId}</div>
                      <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>Transaction ID: {r.paymentId}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', color: '#374151' }}>{r.customerName || 'Standard User'}</div>
                      <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Account Verified</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          fontSize: '10px', fontWeight: '800', color: type.color,
                          background: type.bg, padding: '3px 10px', borderRadius: '50px', width: 'fit-content'
                        }}>
                          {type.icon} {type.label.toUpperCase()}
                        </span>
                        <span style={{ fontSize: '12px', color: '#4B5563', fontWeight: '500' }}>{r.reason}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: '800', color: '#111827', fontSize: '15px' }}>₹{r.amount?.toLocaleString()}</td>
                    <td>
                      <span style={{ background: statusStyle.bg, color: statusStyle.text, padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {statusStyle.icon} {r.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                      {r.status === 'INITIATED' && (
                        <button onClick={() => handleProcessRefund(r.refundId)} style={{ background: '#2563EB', color: '#fff', padding: '10px 18px', fontSize: '12px', borderRadius: '8px', cursor: 'pointer', border: 'none', fontWeight: '700', boxShadow: '0 2px 4px rgba(37,99,235,0.2)' }}>
                          Disburse Funds
                        </button>
                      )}
                      {r.status === 'COMPLETED' && (
                        <button onClick={() => setSelectedRefund(r)} style={{ background: 'transparent', color: '#2563EB', border: 'none', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }}>
                          View Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
 
        {/* --- PAGINATION CONTROLLER --- */}
        {filtered.length > recordsPerPage && (
          <div style={{ padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F9FAFB', borderTop: '1px solid #E5E7EB' }}>
            <span style={{ fontSize: '13px', color: '#6B7280' }}>
              Showing <b>{indexOfFirstRecord + 1}</b> to <b>{Math.min(indexOfLastRecord, filtered.length)}</b> of <b>{filtered.length}</b> records
            </span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{ padding: '8px 12px', border: '1px solid #E5E7EB', background: '#fff', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{ padding: '8px 12px', border: '1px solid #E5E7EB', background: '#fff', borderRadius: '6px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
 
      {/* Receipt Modal (Unchanged) */}
      {selectedRefund && (
        <div onClick={() => setSelectedRefund(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(17, 24, 39, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', padding: '32px', borderRadius: '16px', width: '420px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
             <h2 style={{ marginTop: 0, fontSize: '20px', fontWeight: '800' }}>Refund Confirmation</h2>
             <p style={{ color: '#6B7280', fontSize: '14px' }}>Proof of disbursement for record #REF-{selectedRefund.refundId}</p>
             <div style={{ background: '#F9FAFB', padding: '20px', borderRadius: '12px', margin: '20px 0', border: '1px solid #E5E7EB' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: '#6B7280', fontSize: '14px' }}>Transaction Type</span>
                    <span style={{ fontWeight: '700', color: '#111827' }}>{getRefundType(selectedRefund.reason).label}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: '#6B7280', fontSize: '14px' }}>Recipient</span>
                    <span style={{ fontWeight: '700', color: '#111827' }}>{selectedRefund.customerName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #D1D5DB', paddingTop: '12px' }}>
                    <span style={{ color: '#6B7280', fontSize: '14px', fontWeight: 'bold' }}>Amount Settled</span>
                    <span style={{ fontWeight: '800', color: '#059669', fontSize: '18px' }}>₹{selectedRefund.amount?.toLocaleString()}</span>
                </div>
             </div>
             <button style={{ width: '100%', padding: '14px', background: '#111827', color: '#fff', borderRadius: '10px', border: 'none', fontWeight: '700', cursor: 'pointer', transition: 'opacity 0.2s' }} onClick={() => window.print()}>Print Receipt</button>
             <button style={{ width: '100%', padding: '10px', background: 'transparent', color: '#6B7280', border: 'none', marginTop: '10px', cursor: 'pointer', fontSize: '13px' }} onClick={() => setSelectedRefund(null)}>Close Details</button>
          </div>
        </div>
      )}
    </div>
  );
};
export default RefundsDashboard;