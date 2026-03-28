import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, Label 
} from 'recharts';
import { FiFileText, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { getDashboardStats, getAllCases } from '../../../core/services/api.js';
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
        const [statsRes, casesRes] = await Promise.all([
          getDashboardStats(),
          getAllCases()
        ]);
        const data = statsRes.data;
        setStats({
          totalProposals: Number(data.totalProposals) || 0,
          pendingReview: Number(data.pendingReview) || 0,
          approved: Number(data.approved) || 0,
          declined: Number(data.declined) || 0,
          conditional: Number(data.conditional) || 0
        });
        setRecentActivity(data.recentActivity || []);
        setAllCases(casesRes.data || []);
        if (data.productDistribution) {
          const formattedProducts = Object.keys(data.productDistribution).map(key => ({
            name: key, value: Number(data.productDistribution[key])
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

  const pieData = useMemo(() => [
    { name: 'Approved', value: stats.approved },
    { name: 'Declined', value: stats.declined },
    { name: 'Pending', value: stats.pendingReview },
  ], [stats]);

  const riskData = useMemo(() => {
    const buckets = [
      { range: '0-1', count: 0 }, { range: '1-2', count: 0 },
      { range: '2-3', count: 0 }, { range: '3-4', count: 0 },
      { range: '4-5', count: 0 },
    ];
    allCases.forEach(c => {
      const score = Number(c.riskScore) || 0;
      if (score <= 1) buckets[0].count++;
      else if (score <= 2) buckets[1].count++;
      else if (score <= 3) buckets[2].count++;
      else if (score <= 4) buckets[3].count++;
      else buckets[4].count++;
    });
    return buckets;
  }, [allCases]);

  if (loading) return <div className="loader">Loading Dashboard...</div>;

  return (
    <div className="dashboard-content">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Overview of underwriting activities</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <span>Total Proposals</span>
            <div className="stat-value">{stats.totalProposals}</div>
          </div>
          <div className="stat-icon blue"><FiFileText size={24} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span>Pending Review</span>
            <div className="stat-value">{stats.pendingReview}</div>
          </div>
          <div className="stat-icon yellow"><FiClock size={24} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span>Approved</span>
            <div className="stat-value">{stats.approved}</div>
          </div>
          <div className="stat-icon green"><FiCheckCircle size={24} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span>Declined</span>
            <div className="stat-value">{stats.declined}</div>
          </div>
          <div className="stat-icon red"><FiXCircle size={24} /></div>
        </div>
      </div>

      <div className="charts-container">
        {/* ... Decision Distribution Pie Chart stays the same ... */}
        <div className="chart-box">
           <h3>Decisions Distribution</h3>
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

        <div className="chart-box">
          <h3>Proposals by Product</h3>
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

      <div className="charts-container aligned-row">
        <div className="chart-box">
          <h3>Risk Score Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
          
              <XAxis dataKey="range">
                <Label value="Risk Score Range" offset={-10} position="insideBottom" />
              </XAxis>
              
              <YAxis>
                <Label value="Number of Cases" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
              </YAxis>
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" name="Cases" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box scrollable-box">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className={`activity-dot ${activity.decision?.toLowerCase()}`}></div>
                <div className="activity-info">
                  <p><strong>Case #{activity.uwCaseId}</strong>: {activity.decision}</p>
                  <span>{activity.decisionDate ? new Date(activity.decisionDate).toLocaleString() : 'Recent'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;