import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { getDashboardStats, getAllCases } from '../../../../src/core/services/api.js';
import '../styles/underwriter.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProposals: 0,
    pendingReview: 0,
    approved: 0,
    declined: 0,
    conditional: 0
  });
  const [productData, setProductData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [allCases, setAllCases] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch both Stats and All Cases (for risk distribution)
        const [statsRes, casesRes] = await Promise.all([
          getDashboardStats(),
          getAllCases()
        ]);

        const data = statsRes.data;

        setStats({
          totalProposals: data.totalProposals || 0,
          pendingReview: data.pendingReview || 0,
          approved: data.approved || 0,
          declined: data.declined || 0,
          conditional: data.conditional || 0
        });

        // Set Recent Activity from backend
        setRecentActivity(data.recentActivity || []);
        setAllCases(casesRes.data || []);

        // Convert backend Map to Recharts Array format
        if (data.productDistribution) {
          const formattedProducts = Object.keys(data.productDistribution).map(key => ({
            name: key,
            value: data.productDistribution[key]
          }));
          setProductData(formattedProducts);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate Risk Distribution (0-100)
  const riskData = useMemo(() => {
    const buckets = [
      { range: '0-20', count: 0 },
      { range: '21-40', count: 0 },
      { range: '41-60', count: 0 },
      { range: '61-80', count: 0 },
      { range: '81-100', count: 0 },
    ];
    allCases.forEach(c => {
      const score = c.riskScore || 0;
      if (score <= 20) buckets[0].count++;
      else if (score <= 40) buckets[1].count++;
      else if (score <= 60) buckets[2].count++;
      else if (score <= 80) buckets[3].count++;
      else buckets[4].count++;
    });
    return buckets;
  }, [allCases]);

  // Derived data for Pie Chart
  const pieData = [
    { name: 'Approved', value: stats.approved },
    { name: 'Declined', value: stats.declined },
    { name: 'Pending', value: stats.pendingReview },
  ];

  if (loading) return <div className="loader">Loading Dashboard...</div>;

  return (
    <div className="dashboard-content">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Overview of underwriting activities</p>
      </header>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span>Total Proposals</span>
          <div className="stat-value">{stats.totalProposals}</div>
          <div className="stat-icon blue">📄</div>
        </div>
        <div className="stat-card">
          <span>Pending Review</span>
          <div className="stat-value">{stats.pendingReview}</div>
          <div className="stat-icon yellow">🕒</div>
        </div>
        <div className="stat-card">
          <span>Approved</span>
          <div className="stat-value">{stats.approved}</div>
          <div className="stat-icon green">✅</div>
        </div>
        <div className="stat-card">
          <span>Declined</span>
          <div className="stat-value">{stats.declined}</div>
          <div className="stat-icon red">❌</div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="charts-container">
        <div className="chart-box">
          <h3>Decisions Distribution</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={80} dataKey="value" nameKey="name">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-box">
          <h3>Proposals by Product</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={productData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Risk Distribution Chart */}
      <div className="chart-box full-width">
        <h3>Risk Score Distribution</h3>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" name="Number of Cases" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="chart-box full-width">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {recentActivity.length > 0 ? recentActivity.map((activity) => (
            <div key={activity.uwCaseId} className="activity-item">
              <div className={`activity-dot ${(activity.decision || 'pending').toLowerCase()}`}></div>
              <div className="activity-info">
                <p><strong>Case #{activity.uwCaseId}</strong>: {activity.decision}</p>
                <span>{activity.decisionDate ? new Date(activity.decisionDate).toLocaleString() : 'Recent'}</span>
              </div>
            </div>
          )) : <p>No recent activity found.</p>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;