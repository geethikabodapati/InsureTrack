import React, { useEffect, useState } from 'react';
import { CreditCard, CheckCircle, AlertCircle, DollarSign, Wallet } from 'lucide-react';
 
const ClaimsDashboard = () => {
  const [settlements, setSettlements] = useState([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    fetchSettlements();
  }, []);
 
  const fetchSettlements = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8082/api/adjuster/claims/settlements/all", {
        headers: { "Authorization": `Bearer ${token}` }
      });
 
      if (!res.ok) throw new Error("Server Error");
 
      const data = await res.json();
     
      // // Filter Pending for the table
      // const pending = data.filter(s => s.status === 'PENDING');
      // setSettlements(pending);
 
      // // Calculate total of already COMPLETED/PAID settlements for the new stat card
      // const totalPaid = data
      //   .filter(s => s.status === 'COMPLETED' || s.status === 'PAID')
      //   .reduce((acc, curr) => acc + curr.settlementAmount, 0);
      // setHistoryTotal(totalPaid);
      // Filter for anything that is NOT COMPLETED or PAID
const pending = data.filter(s => s.status === 'PENDING' || s.status === 'FAILED');
setSettlements(pending);
 
// Filter for history
const totalPaid = data
  .filter(s => s.status === 'COMPLETED' || s.status === 'PAID')
  .reduce((acc, curr) => acc + curr.settlementAmount, 0);
setHistoryTotal(totalPaid);
 
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };
 
 
  const handleProcessPayment = async (settlementId) => {
    if (!window.confirm(`Confirm disbursement for Settlement #SET-${settlementId}?`)) return;
 
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8082/api/adjuster/claims/settlements/${settlementId}/pay`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
 
      if (res.ok) {
        // This is the "Magic" part:
        // 1. Show the success message
        alert("Payment Successful! Status updated to PAID in database.");
       
        // 2. Re-fetch the data from the backend to reflect the change immediately
        fetchSettlements();
      } else {
        alert("Server refused the payment. Check backend logs.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Network error: Could not reach the server.");
    }
  };
  // const handleProcessPayment = async (settlementId) => {
  //   if (!window.confirm(`Confirm disbursement for Settlement #SET-${settlementId}?`)) return;
 
  //   try {
  //     const token = localStorage.getItem("token");
  //     const res = await fetch(`http://localhost:8082/api/adjuster/claims/settlements/${settlementId}/pay`, {
  //       method: 'POST',
  //       headers: { "Authorization": `Bearer ${token}` }
  //     });
 
  //     if (res.ok) {
  //       alert("Payment Successful!");
  //       fetchSettlements();
  //     }
  //   } catch (err) {
  //     alert("Processing error.");
  //   }
  // };
 
  return (
    <div className="it-page" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Section */}
      <div className="it-page-header" style={{ marginBottom: '40px' }}>
        <h1 className="it-page-title" style={{ fontSize: '28px', fontWeight: '800', color: '#111827' }}>
          Financial Settlement Hub
        </h1>
        <p className="it-page-subtitle" style={{ color: '#6b7280', marginTop: '8px', fontSize: '16px' }}>
          Manage pending disbursements and track historical claim payouts.
        </p>
      </div>
 
      {/* Modern Stat Cards */}
      <div className="it-stat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
        <div className="it-stat-card" style={{ padding: '24px', borderRadius: '16px', background: '#fff', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',width: '100%' }}>
            <div>
              <p style={{ color: '#6b7280', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Awaiting Payout</p>
              <p style={{ fontSize: '32px', fontWeight: '800', color: '#B45309', marginTop: '4px' }}>{settlements.length} Claims</p>
            </div>
            <div style={{ background: 'white',width:'60px', height:'60px', display: 'flex',          
            // Added to center the icon inside the white box
                  alignItems: 'center',      // Vertical center
                  justifyContent: 'center',   // Horizontal center
                  borderRadius: '12px',      
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
              <AlertCircle size={28} color="#B45309" />
            </div>
          </div>
        </div>
 
        <div className="it-stat-card" style={{ padding: '24px', borderRadius: '16px', background: '#fff', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',width: '100%' }}>
            <div>
              <p style={{ color: '#6b7280', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Disbursed (History)</p>
              <p style={{ fontSize: '32px', fontWeight: '800', color: '#059669', marginTop: '4px' }}>₹{historyTotal.toLocaleString()}</p>
            </div>
            <div style={{ background: 'white',width:'60px', height:'60px', display: 'flex',          
            // Added to center the icon inside the white box
                  alignItems: 'center',      // Vertical center
                  justifyContent: 'center',   // Horizontal center
                  borderRadius: '12px',      
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
              <Wallet size={28} color="#059669" />
            </div>
          </div>
        </div>
      </div>
 
      {/* Clean Table Section */}
      <div className="it-section" style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px', color: '#1f2937' }}>Pending Settlement Queue</h2>
       
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
          <thead>
            <tr style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'left', textTransform: 'uppercase' }}>
              <th style={{ padding: '0 16px' }}>Reference IDs</th>
              <th style={{ padding: '0 16px' }}>Date Issued</th>
              <th style={{ padding: '0 16px' }}>Amount</th>
              <th style={{ padding: '0 16px' }}>Status</th>
              <th style={{ padding: '0 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {settlements.map((s) => (
              <tr key={s.settlementId} style={{ background: '#f9fafb', transition: 'transform 0.2s' }}>
                <td style={{ padding: '20px 16px', borderRadius: '12px 0 0 12px' }}>
                  <div style={{ fontWeight: '700', color: '#111827', fontFamily: 'monospace', fontSize: '15px' }}>SET-{s.settlementId}</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>Claim Ref: #CLM-{s.claimId}</div>
                </td>
                <td style={{ padding: '20px 16px', color: '#4b5563' }}>{s.settlementDate}</td>
                <td style={{ padding: '20px 16px', fontWeight: '800', fontSize: '16px', color: '#111827' }}>
                  ₹{s.settlementAmount.toLocaleString()}
                </td>
                <td style={{ padding: '20px 16px' }}>
                  <span style={{ background: '#FEF3C7', color: '#92400E', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                    {s.status}
                  </span>
                </td>
                <td style={{ padding: '20px 16px', textAlign: 'right', borderRadius: '0 12px 12px 0' }}>
                  <button
                    className="create-btn"
                    style={{ background: '#111827', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    onClick={() => handleProcessPayment(s.settlementId)}
                  >
                    <CreditCard size={16} /> Disburse Funds
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
 
        {settlements.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <CheckCircle size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
            <p style={{ color: '#9ca3af', fontSize: '16px' }}>All queues are clear. No pending payments.</p>
          </div>
        )}
      </div>
    </div>
  );
};
 
export default ClaimsDashboard;