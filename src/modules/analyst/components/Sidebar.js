import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/sidebar.css";

const Sidebar = ({ active }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const storedUser = JSON.parse(localStorage.getItem("user"));

  console.log("Stored user:", storedUser);
  const userEmail = storedUser?.email || "Analyst";

  return (
    <div className="app-layout">
      {/* Sidebar fixed on the left */}
      <aside className="sidebar" style={{backgroundColor:"#f9fafb", color:"black"}}>
        <h2>Analyst Dashboard</h2>
        <nav>
          <ul>
            <li className={active === "overview" ? "active" : ""} onClick={() => navigate("/analyst-dashboard")}>📊 Overview</li>
            <li className={active === "billing" ? "active" : ""} onClick={() => navigate("/billing-dashboard")}>📄Billing</li>
            <li className={active === "payments" ? "active" : ""} onClick={() => navigate("/payments-dashboard")}>💳Payments</li>
            <li className={active === "claims" ? "active" : ""} onClick={() => navigate("/claims-dashboard")}>📦Claims</li>
            <li className={active === "refunds" ? "active" : ""} onClick={() => navigate("/refund-dashboard")}>🔄Refund</li>
          </ul>
        </nav>
      </aside>

      {/* Right section contains topnav + content */}
      <div className="right-section">
        <header className="topnav" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="topnav-left" style={{ marginRight: "auto" }}>
            <h1>Financial Dashboard</h1>
            <p>Monitor and manage billing & payments</p>
          </div>
          <div className="topnav-right">
            <button className="notif-btn">🔔</button>
            

            <span className="user-name">
              {storedUser?.name || storedUser?.email || "Analyst"}
            </span>


            
            <button
              className="logout-btn"
              onClick={() => {
                localStorage.clear();
                navigate("/auth/login");
              }}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="main-content">
          {/* KPI cards, tables, charts */}
        </main>
      </div>
    </div>
  );
};

export default Sidebar;
