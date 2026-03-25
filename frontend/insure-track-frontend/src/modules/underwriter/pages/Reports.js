import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, LabelList 
} from 'recharts';
import { getDashboardStats } from '../../../../src/core/services/api.js';
import { ShieldCheck, BarChart3, Activity } from 'lucide-react';
import '../styles/underwriter.css';

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getDashboardStats();
        setStats(response.data);
        setLoading(false);
        // Trigger entrance animation after data loads
        setTimeout(() => setIsVisible(true), 100);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Data Transformation: Cases by Product
  const productData = useMemo(() => {
    if (!stats?.productDistribution) return [];
    return Object.entries(stats.productDistribution).map(([name, count]) => ({
      name,
      count: Number(count),
    }));
  }, [stats]);

  // Data Transformation: Decision Breakdown
  const decisionData = useMemo(() => [
    { name: 'Approved', value: Number(stats?.approved || 0), color: '#10b981' },
    { name: 'Declined', value: Number(stats?.declined || 0), color: '#ef4444' },
    { name: 'Pending', value: Number(stats?.pendingReview || 0), color: '#f59e0b' },
  ], [stats]);

  if (loading) return <div className="loader">Analyzing Portfolio...</div>;

  return (
    <div className={`reports-page ${isVisible ? 'fade-in' : ''}`}>
      <div className="reports-header">
        <div className="header-text">
          <h2>Operational Intelligence</h2>
          <p>Real-time Underwriting Performance & Risk Distribution</p>
        </div>
      </div>

      <div className="reports-dual-grid">
        
        {/* Visual 1: Product Volume */}
        <div className="report-card animated-card">
          <div className="card-header-flex">
            <div className="title-group">
              <h3>Product Distribution</h3>
              <span className="badge-pill volume">Volume</span>
            </div>
            {/* Icon positioned top-right */}
            <div className="icon-wrapper bg-blue-soft">
               <ShieldCheck size={20} className="text-blue" />
            </div>
          </div>
          
          <div className="chart-container-fixed">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={productData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} 
                />
                <Bar 
                  dataKey="count" 
                  fill="#3b82f6" 
                  radius={[6, 6, 0, 0]} 
                  barSize={35}
                  animationBegin={300}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  <LabelList dataKey="count" position="top" style={{ fill: '#64748b', fontSize: 12 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visual 2: Outcome Ratio */}
        <div className="report-card animated-card">
          <div className="card-header-flex">
            <div className="title-group">
              <h3>Decision Outcomes</h3>
              <span className="badge-pill ratio">Ratio</span>
            </div>
            {/* Icon positioned top-right */}
            <div className="icon-wrapper bg-indigo-soft">
                <Activity size={20} className="text-indigo" />
            </div>
          </div>

          <div className="chart-container-fixed">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={decisionData} layout="vertical" margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 500}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar 
                  dataKey="value" 
                  radius={[0, 6, 6, 0]} 
                  barSize={35}
                  animationBegin={600}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {decisionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList dataKey="value" position="right" style={{ fill: '#64748b', fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Detailed Data Table */}
      <div className="report-card full-width-table animated-card delay-3">
        <div className="card-header-flex">
          <div className="title-group">
            <h3>Recent Performance Logs</h3>
            <span className="badge-pill logs">Historical</span>
          </div>
          <div className="icon-wrapper">
            <BarChart3 size={18} color="#94a3b8" />
          </div>
        </div>
        <div className="table-responsive">
          <table className="report-table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Status</th>
                <th>Risk Score</th>
                <th>Underwriting Date</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentActivity?.map((row, i) => (
                <tr key={i} className="table-row-hover">
                  <td><strong>{row.uwCaseId}</strong></td>
                  <td>
                    <span className={`status-pill ${(row.decision || 'pending').toLowerCase()}`}>
                      {row.decision}
                    </span>
                  </td>
                  <td>
                    <div className="risk-score-indicator">
                      <progress value={row.riskScore} max="10"></progress>
                      <span>{row.riskScore}/10</span>
                    </div>
                  </td>
                  <td>{row.decisionDate ? new Date(row.decisionDate).toLocaleDateString() : 'Pending'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;