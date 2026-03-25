import React, { useState, useEffect } from 'react';
import { FiFileText, FiShield, FiRotateCw, FiXCircle } from "react-icons/fi";
import {
    getAllQuotes,
    fetchActivePolicies,
    fetchAgentEndorsements,
    fetchAgentCancellations
} from '../../../core/services/api.js';

const DashboardStats = () => {
    const [counts, setCounts] = useState({
        quotes: 0,
        policies: 0,
        endorsements: 0,
        cancellations: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                const [qRes, pRes, eRes, cRes] = await Promise.all([
                    getAllQuotes(),
                    fetchActivePolicies(),
                    fetchAgentEndorsements(),
                    fetchAgentCancellations()
                ]);

                setCounts({
                    quotes: qRes.data?.length || 0,
                    policies: pRes.data?.length || 0,
                    endorsements: eRes.data?.filter(e => e.status === 'PENDING').length || 0,
                    cancellations: cRes.data?.length || 0
                });
            } catch (error) {
                console.error("Error calculating dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const kpiData = [
        { title: "Total Quotes", value: counts.quotes, icon: <FiFileText />, colorClass: "stat-blue" },
        { title: "Active Policies", value: counts.policies, icon: <FiShield />, colorClass: "stat-green" },
        { title: "Pending Endorsements", value: counts.endorsements, icon: <FiRotateCw />, colorClass: "stat-orange" },
        { title: "Cancellations", value: counts.cancellations, icon: <FiXCircle />, colorClass: "stat-purple" },
    ];

    if (loading) return <div className="stats-row-loading">Updating Stats...</div>;

    return (
        <div className="stats-grid">
            {kpiData.map((kpi, index) => (
                <div key={index} className="stat-card">
                    <div className="stat-details">
                        <span className="stat-title">{kpi.title}</span>
                        <h2 className="stat-value">{kpi.value}</h2>
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