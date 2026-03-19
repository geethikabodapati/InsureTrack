import React from "react";
import Sidebar from "./Sidebar";
import "../styles/analyst.css";
import Login from "../../user/components/Login";


const AnalystDashboard = () => (
  <div className="dashboard-layout">
    <Sidebar active="overview" />
    <div className="main-content">
      {/* Topbar + KPIs + Charts */}
    </div>
  </div>
);


export default AnalystDashboard;




















//import React from "react";
//import { useNavigate } from "react-router-dom";
//import "../../../styles/analyst.css";
//
//const AnalystDashboard = () => {
//  const navigate = useNavigate();
//
//  return (
//    <div className="analyst-dashboard">
//      {/* Sidebar */}
//      <aside className="sidebar">
//        <h2>Insurance Analytics</h2>
//        <nav>
//          <ul>
//            <li className="active" onClick={() => navigate("/analyst-dashboard")}>Overview</li>
//            <li onClick={() => navigate("/billing-dashboard")}>Billing</li>
//            <li onClick={() => navigate("/payments-dashboard")}>Payments</li>
//            <li onClick={() => navigate("/claims-dashboard")}>Claims</li>
//            <li onClick={() => navigate("/analytics-dashboard")}>Analytics</li>
//          </ul>
//        </nav>
//      </aside>
//
//      {/* Main Content */}
//      <div className="main-content">
//        <header className="topbar">
//          <div>
//            <h1>Financial Dashboard</h1>
//            <p>Monitor and manage billing & payments</p>
//          </div>
//          <div className="profile">
//            <span>Sarah Johnson</span>
//            <span className="role">Finance & Compliance Analyst</span>
//            <div className="profile-actions">
//              <button className="notif-btn">🔔</button>
//              <button
//                className="logout-btn"
//                onClick={() => {
//                  localStorage.clear();
//                  navigate("/auth/login");
//                }}
//              >
//                Logout
//              </button>
//            </div>
//          </div>
//        </header>
//
//        {/* KPI Cards */}
//        <section className="kpi-cards">
//          <div className="card">Total Revenue: $943K ↑ 12.5%</div>
//          <div className="card">Outstanding: $124K ↓ 3.2%</div>
//          <div className="card">Active Policies: 2,847 ↑ 8.1%</div>
//          <div className="card">Payment Rate: 94.2% ✔ On target</div>
//        </section>
//      </div>
//    </div>
//  );
//};
//
//export default AnalystDashboard;
