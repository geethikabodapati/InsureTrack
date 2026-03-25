import React, { useEffect, useState } from 'react';
import { DollarSign, Shield, Car, Box, Clock, ChevronRight, Activity, AlertTriangle, TrendingUp } from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
    Cell, PieChart, Pie 
} from 'recharts';
import { getAdminDashboardStats, getAllProducts } from '../../../core/services/api.js'; 
import '../styles/Dashboard.css';

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getAdminDashboardStats(), getAllProducts()])
            .then(([statsRes, productsRes]) => {
                setData(statsRes.data);
                // Filter for ACTIVE only as requested
                setProducts(productsRes.data.filter(p => p.status === 'ACTIVE').slice(0, 6)); 
            })
            .catch(err => console.error("Sync Error:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading-overlay">Synchronizing Risk Engine...</div>;

    const chartData = data.vehicleDistribution.map(v => ({
        name: v.type, // Backend renamed 'Vehicle' to 'Car'
        value: v.count,
        fill: v.color
    }));

    // Logic to determine Risk Health Color
    // Combined Ratio > 100% is technically an underwriting loss
    const riskValue = parseFloat(data.portfolioRiskScore);
    const riskStatusColor = riskValue > 100 ? "#ef4444" : "#f59e0b";

    return (
        <div className="dashboard-root">
            <header className="dashboard-main-header">
                <div className="title-group">
                    <h1>Overview</h1>
                    <span className="live-tag">● SYSTEM LIVE</span>
                </div>
            </header>

            {/* KPI Row: Icons Top-Right, Text Left */}
            <div className="metrics-grid">
                <MetricCard 
                    label="Gross Written Premium" 
                    val={`₹${data.totalGrossPremium.toLocaleString('en-IN')}`} 
                    icon={<DollarSign/>} 
                    clr="#3b82f6"
                />
                <MetricCard 
                    label="Active Policies" 
                    val={data.activePolicies} 
                    icon={<Shield/>} 
                    clr="#10b981"
                />
                <MetricCard 
                    label="Combined Risk Ratio" 
                    val={data.portfolioRiskScore} 
                    icon={<AlertTriangle/>} 
                    clr={riskStatusColor}
                    subtitle={riskValue > 100 ? "High Exposure" : "Healthy Margin"}
                />
            </div>

            <div className="charts-full-row">
                {/* Chart 1: Distribution */}
                <div className="viz-card flex-1">
                    <div className="card-header">
                        <div className="header-text">
                            <h4>Risk Segmentation</h4>
                            <p>Asset Ratio</p>
                        </div>
                        <TrendingUp size={18} color="#a3aed0" />
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={chartData} innerRadius={65} outerRadius={85} dataKey="value" paddingAngle={8}>
                                {chartData.map((e, i) => <Cell key={i} fill={e.fill} cornerRadius={10} />)}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Chart 2: Volume */}
                <div className="viz-card flex-2">
                    <div className="card-header">
                        <div className="header-text">
                            <h4>Inventory Volume</h4>
                            <p>Product Distribution</p>
                        </div>
                        <Activity size={18} color="#a3aed0" />
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={chartData}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#a3aed0', fontSize: 12}} />
                            <Tooltip cursor={{fill: '#f4f7fe'}} />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={35}>
                                {chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="activity-section">
                <div className="section-title">
                    <Clock size={20} />
                    <h3>Active Products</h3>
                </div>
                <div className="horizontal-feed">
                    {products.map((p, i) => (
                        <div key={i} className="product-activity-card">
                            <div className="activity-text">
                                <p className="p-name">{p.name}</p>
                                <p className="p-tag">Active</p>
                            </div>
                            <div className="icon-group">
                                <Box size={18} className="box-icon" />
                                <div className="hover-trigger">
                                    <ChevronRight className="arrow-icon" />
                                    <div className="detail-popover">
                                        <h6>{p.name}</h6>
                                        <p><strong>Coverages:</strong> {p.coverages?.length || 0}</p>
                                        <p className="p-desc">{p.description || "Active high-performance product."}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Reusable Metric Card with Icon on Top Right
const MetricCard = ({label, val, icon, clr, subtitle}) => (
    <div className="m-card">
        <div className="m-text">
            <span className="m-label">{label}</span>
            <span className="m-value">{val}</span>
            {subtitle && <span className="m-subtitle" style={{color: clr}}>{subtitle}</span>}
        </div>
        <div className="m-icon-box" style={{color: clr, backgroundColor: `${clr}12`}}>
            {icon}
        </div>
    </div>
);

export default AdminDashboard;