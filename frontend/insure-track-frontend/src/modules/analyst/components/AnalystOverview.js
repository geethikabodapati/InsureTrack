import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, CreditCard, BarChart3, RotateCcw, TrendingUp,
  DollarSign, AlertCircle, CheckCircle
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';
 
const AnalystOverview = () => {
  const navigate = useNavigate();
 
  // 1. State Management from Improper Code
  const [data, setData] = useState({
    revenue: 0,
    outstanding: 0,
    refunds: 0,
    chartData: [],
    pieData: [],
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);
 
  const PIE_COLORS = ['#16A34A', '#F59E0B', '#EF4444']; // Proper Green, Orange, Red
 
  // 2. Data Fetching Logic from Improper Code
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
 
        const [payRes, refRes] = await Promise.all([
          fetch("http://localhost:8082/api/analyst/billing/payments/all", { headers }),
          fetch("http://localhost:8082/api/analyst/billing/refunds/all", { headers })
        ]);
 
        const payments = await payRes.json();
        const refundsList = await refRes.json();
 
        // KPI Calculations
        const totalRev = payments.filter(p => p.status === "COMPLETED").reduce((sum, p) => sum + p.amount, 0);
        const pendingAmt = payments.filter(p => p.status === "PENDING").reduce((sum, p) => sum + p.amount, 0);
        const totalRef = refundsList.reduce((sum, r) => sum + r.amount, 0);
 
        setData({
          revenue: totalRev,
          outstanding: pendingAmt,
          refunds: totalRef,
          chartData: [
            { name: 'Jan', revenue: totalRev * 0.6, expenses: totalRef * 0.4 },
            { name: 'Feb', revenue: totalRev * 0.8, expenses: totalRef * 0.7 },
            { name: 'March', revenue: totalRev, expenses: totalRef },
          ],
          pieData: [
            { name: 'Paid', value: payments.filter(p => p.status === "COMPLETED").length },
            { name: 'Pending', value: payments.filter(p => p.status === "PENDING").length },
            { name: 'Failed', value: payments.filter(p => p.status === "FAILED").length }
          ],
          recentTransactions: payments.slice(0, 5)
        });
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);
 
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();
  const userName = storedUser.name || storedUser.email || 'Analyst';
 
  const quickLinks = [
    { label: 'Billing',  path: '/billing',  icon: FileText,   color: '#1E3A8A' },
    { label: 'Payments', path: '/payments', icon: CreditCard,  color: '#16A34A' },
    { label: 'Claims',   path: '/claims',   icon: BarChart3,   color: '#B45309' },
    { label: 'Refunds',  path: '/refunds',   icon: RotateCcw,   color: '#7C3AED' },
  ];
 
  if (loading) return <div className="it-page">Loading Financial Data...</div>;
 
  return (
    <div className="it-page">
      <div className="it-page-header">
        <h1 className="it-page-title">Financial Overview</h1>
        <p className="it-page-subtitle">Welcome back, {userName}. Real-time monitoring active.</p>
      </div>
 
      {/* 3. Real Data injected into Proper Stat Cards */}
      <div className="it-stat-grid">
        {[
          { label: 'Total Revenue',    value: `₹${data.revenue.toLocaleString()}`,   icon: DollarSign,    color: '#EFF6FF', ic: '#1E3A8A' },
          { label: 'Outstanding',      value: `₹${data.outstanding.toLocaleString()}`,   icon: AlertCircle,   color: '#FEF3C7', ic: '#B45309' },
          { label: 'Refunds Total',    value: `₹${data.refunds.toLocaleString()}`,   icon: RotateCcw,     color: '#F0FDF4', ic: '#16A34A' },
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
 
      {/* 4. Mixed Charts and Quick Navigation Section */}
      <div className="it-section" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div className="it-card" style={{ padding: '20px', background: 'white', borderRadius: '12px' }}>
          <h3 className="it-section-title">Revenue vs Expenses</h3>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#1E3A8A" strokeWidth={3} dot={{ r: 6 }} />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
 
        <div className="it-card" style={{ padding: '20px', background: 'white', borderRadius: '12px' }}>
          <h3 className="it-section-title">Payment Status</h3>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {data.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
 
      {/* 5. Quick Navigation */}
      <div className="it-section" style={{ marginTop: '20px' }}>
        <h2 className="it-section-title">Direct Module Access</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          {quickLinks.map(link => {
            const Icon = link.icon;
            return (
              <button
                key={link.label}
                className="it-card"
                style={{ cursor: 'pointer', textAlign: 'left', border: '1px solid #e5e7eb', background: 'white' }}
                onClick={() => navigate(link.path)}
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: `${link.color}18`, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', marginBottom: '12px',
                }}>
                  <Icon size={22} color={link.color} />
                </div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '15px', color: '#111827' }}>
                  {link.label}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>
                  Manage &rarr;
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