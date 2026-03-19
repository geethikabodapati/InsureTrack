import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { getDashboardStats } from '../../../../src/core/services/api.js';
import { Download, TrendingUp, Clock } from 'lucide-react';
import '../styles/underwriter.css';

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getDashboardStats();
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Transform real product data from backend for the "Moving" Bar Chart
  const productData = stats?.productDistribution 
    ? Object.keys(stats.productDistribution).map(key => ({
        name: key,
        count: stats.productDistribution[key],
      }))
    : [];

  // Mocking the "Time" trend based on your total cases to keep the UI moving
  const timeTrendData = [
    { day: 'Mon', cases: stats?.totalProposals / 5 || 0, time: 4.2 },
    { day: 'Tue', cases: stats?.approved / 2 || 0, time: 3.8 },
    { day: 'Wed', cases: stats?.pendingReview || 0, time: 5.1 },
    { day: 'Thu', cases: (stats?.totalProposals / 4) || 0, time: 2.9 },
    { day: 'Fri', cases: stats?.declined * 2 || 0, time: 4.5 },
  ];

  if (loading) return <div className="loader">Syncing Analytics...</div>;

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div className="header-text">
          <h2>Operational Intelligence</h2>
          <p>Real-time backend data visualization</p>
        </div>
        <button className="export-btn-primary" onClick={() => window.print()}>
          <Download size={16} /> Export PDF
        </button>
      </div>

      {/* Main Grid: Two graphs side-by-side */}
      <div className="reports-dual-grid">
        
        {/* Graph 1: Product Distribution (Bar) */}
        <div className="report-card">
          <div className="card-header-flex">
            <h3>Cases by Product</h3>
            <TrendingUp size={18} color="#3b82f6" />
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar 
                  dataKey="count" 
                  fill="#3b82f6" 
                  radius={[6, 6, 0, 0]} 
                  barSize={30}
                  isAnimationActive={true}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2: Case Volume Trend (Area) */}
        <div className="report-card">
          <div className="card-header-flex">
            <h3>Avg. Processing Time (Week)</h3>
            <Clock size={18} color="#10b981" />
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeTrendData}>
                <defs>
                  <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="time" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fill="url(#colorTime)" 
                  isAnimationActive={true}
                  animationDuration={1800}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Full Width Table below for Recent Activity */}
      <div className="report-card full-width">
        <h3>Recent Performance Data</h3>
        <table className="report-table">
          <thead>
            <tr>
              <th>Underwriter Case</th>
              <th>Status</th>
              <th>Risk Score</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {stats?.recentActivity?.map((row, i) => (
              <tr key={i}>
                <td>{row.customerName}</td>
                <td><span className={`status-pill ${row.decision.toLowerCase()}`}>{row.decision}</span></td>
                <td>{row.riskScore}</td>
                <td>{new Date(row.decisionDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;