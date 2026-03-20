// src/modules/agent/AgentDashboard.jsx
import React from 'react';
import DashboardStats from './components/DashboardStats';
import QuoteManagement from './components/QuoteManagement';
import './styles/agentModule.css'; // New combined styling file
import PolicyManagement from './components/PolicyManagement';
import EndorsementManagement from './components/EndorsementManagement';
import CancellationManagement from './components/CancellationManagement';
import RenewalManagement from './components/RenewalManagement';

const AgentDashboard = () => {
    return (
        <div className="dashboard-content-wrapper">
            {/* 1. Introductory Header */}
            <div className="page-intro">
                <h1>Dashboard</h1>
                <p>Welcome back, John. Here's your insurance portfolio overview.</p>
            </div>

            {/* 2. KPI Cards Row */}
            {/* <DashboardStats /> */}

            {/* 3. Quote Management Table (Main dashboard view as requested) */}
            {/* <QuoteManagement />

            < PolicyManagement />
            < EndorsementManagement />
            <RenewalManagement />
            <CancellationManagement /> */}
        </div>
    );
};

export default AgentDashboard;