// src/modules/agent/components/DashboardStats.jsx
import React from 'react';
import { FiFileText, FiShield, FiRotateCw, FiClock } from "react-icons/fi"; // Matching the icon style in Figma

const DashboardStats = () => {
    // This is hardcoded for the UI build, later you'll connect this to an API
    const kpiData = [
        {
            title: "Total Quotes",
            value: "142",
            trend: "+12%",
            icon: <FiFileText />,
            colorClass: "stat-blue",
        },
        {
            title: "Active Policies",
            value: "1,234",
            trend: "+8%",
            icon: <FiShield />,
            colorClass: "stat-green",
        },
        {
            title: "Pending Endorsements",
            value: "23",
            trend: "-5%",
            icon: <FiRotateCw />,
            colorClass: "stat-orange",
        },
        {
            title: "Upcoming Renewals",
            value: "87",
            trend: "+15%",
            icon: <FiClock />,
            colorClass: "stat-purple",
        },
    ];

    return (
        <div className="stats-grid">
            {kpiData.map((kpi, index) => (
                <div key={index} className="stat-card">
                    <div className="stat-details">
                        <span className="stat-title">{kpi.title}</span>
                        <h2 className="stat-value">{kpi.value}</h2>
                        <span className={`stat-trend ${kpi.trend.startsWith('+') ? 'trend-up' : 'trend-down'}`}>
                            {kpi.trend} from last month
                        </span>
                    </div>
                    <div className={`stat-icon-wrapper ${kpi.colorClass}`}>
                        {kpi.icon}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DashboardStats;