import React from 'react';
import { DollarSign, Shield, Users, Activity, Car, Truck, Bus } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import '../styles/Dashboard.css';
 
const AdminDashboard = () => {
    // Mock Data for Vehicle Distribution
    const vehicleData = [
        { name: 'CAR', value: 400, color: '#3b82f6' },
        { name: 'BIKE', value: 300, color: '#10b981' },
        { name: 'TRUCK', value: 200, color: '#f59e0b' },
        { name: 'BUS', value: 100, color: '#ef4444' },
        { name: 'VAN', value: 80, color: '#8b5cf6' },
        { name: 'TRACTOR', value: 50, color: '#64748b' },
        { name: 'AUTO', value: 120, color: '#ec4899' },
    ];
 
    // Mock Data for Premium vs Claims Trend
    const trendData = [
        { month: 'Jan', premium: 45000, claims: 21000 },
        { month: 'Feb', premium: 52000, claims: 24000 },
        { month: 'Mar', premium: 48000, claims: 28000 },
        { month: 'Apr', premium: 61000, claims: 32000 },
        { month: 'May', premium: 55000, claims: 29000 },
        { month: 'Jun', premium: 67000, claims: 35000 },
    ];
 
    const stats = [
        { label: "Gross Premium", value: "$2,456,890", icon: <DollarSign size={24} color="#2563eb"/> },
        { label: "Active Policies", value: "8,245", icon: <Shield size={24} color="#16a34a"/> },
        { label: "Insured Vehicles", value: "1,257", icon: <Car size={24} color="#7c3aed"/> },
        { label: "Claims Ratio", value: "42%", icon: <Activity size={24} color="#ea580c"/> },
    ];
 
    return (
        <div className="dashboard-wrapper">
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 8px 0' }}>Admin Overview</h1>
                <p style={{ color: '#64748b', margin: 0 }}>Monitoring Vehicle Insurance Portfolio Performance</p>
            </div>
 
            {/* Top Stats */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>{stat.label}</p>
                            <h3 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>{stat.value}</h3>
                        </div>
                        <div style={{ padding: '12px', borderRadius: '12px', background: '#f1f5f9' }}>{stat.icon}</div>
                    </div>
                ))}
            </div>
 
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Main Trend Chart */}
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '600' }}>Premium vs Claims (Last 6 Months)</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="premium" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6 }} />
                                <Line type="monotone" dataKey="claims" stroke="#ef4444" strokeWidth={3} dot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
 
                {/* Vehicle Distribution Chart */}
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '600' }}>Portfolio by Vehicle Type</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={vehicleData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={70} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {vehicleData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};
 
export default AdminDashboard;