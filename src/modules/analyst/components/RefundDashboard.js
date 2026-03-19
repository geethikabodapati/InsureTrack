import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
// import "../../../styles/refunds.css";

const RefundsDashboard = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  // for preview modal
  const [selectedRefund, setSelectedRefund] = useState(null);

  // user info
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userEmail = storedUser?.name || storedUser?.email || "Analyst";

  useEffect(() => {
    const fetchRefunds = async () => {
      try {
        const response = await fetch(
          "http://localhost:8082/api/analyst/billing/refunds/all",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch refunds");
        }
        const data = await response.json();
        console.log("Refunds from backend:", data);
        setRefunds(data);
      } catch (error) {
        console.error("Error fetching refunds:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRefunds();
  }, []);

  // KPI calculations
  const totalRefunds = refunds.reduce((sum, r) => sum + r.amount, 0);
  const completed = refunds
    .filter((r) => r.status === "COMPLETED")
    .reduce((sum, r) => sum + r.amount, 0);
  const pending = refunds
    .filter((r) => r.status === "PENDING")
    .reduce((sum, r) => sum + r.amount, 0);
  const failed = refunds
    .filter((r) => r.status === "FAILED")
    .reduce((sum, r) => sum + r.amount, 0);

  // Apply filter
  const filteredRefunds =
    filter === "ALL" ? refunds : refunds.filter((r) => r.status === filter);

  return (
    <div className="app-layout">
      <Sidebar active="refunds" />
      <div className="right-section">
        <header className="topnav">
          <div className="topnav-left">
            <h1>Refunds Dashboard</h1>
            <p>Track and manage all refunds</p>
          </div>
          <div className="topnav-right">
            <button className="notif-btn">🔔</button>
            <span className="user-name">{userEmail}</span>
            <button className="logout-btn">Logout</button>
          </div>
        </header>

        <main className="main-content">
          {/* KPI Cards */}
          <section className="r-kpi-cards" style={{display:"flex",gap:"30px",marginBottom:"30px"}}>
            <div className="card1" style={{backgroundColor:"blue",color:"white",padding:"25px",borderRadius:"6px",flex:"1"}}>
              Total Refunds: <span style={{fontSize:"25px"}}>${totalRefunds}</span>
            </div>
            <div className="card2" style={{backgroundColor:"green",color:"white",padding:"25px",borderRadius:"6px",flex:"1"}}>
              Completed: <span style={{fontSize:"25px"}}>${completed}</span>
            </div>
            <div className="card3" style={{backgroundColor:"orange",color:"white",padding:"25px",borderRadius:"6px",flex:"1"}}>
              Pending: <span style={{fontSize:"25px"}}>${pending}</span>
            </div>
            <div className="card4" style={{backgroundColor:"red",color:"white",padding:"25px",borderRadius:"6px",flex:"1"}}>
              Failed: <span style={{fontSize:"25px"}}>${failed}</span>
            </div>
          </section>

          {/* Status Filter Nav */}
          <div className="status-nav">
            <button className={filter === "ALL" ? "active" : ""} onClick={() => setFilter("ALL")}>
              All ({refunds.length})
            </button>
            <button className={filter === "COMPLETED" ? "active" : ""} onClick={() => setFilter("COMPLETED")}>
              Completed ✅ ({refunds.filter((r) => r.status === "COMPLETED").length})
            </button>
            <button className={filter === "PENDING" ? "active" : ""} onClick={() => setFilter("PENDING")}>
              Pending ⏳ ({refunds.filter((r) => r.status === "PENDING").length})
            </button>
            <button className={filter === "FAILED" ? "active" : ""} onClick={() => setFilter("FAILED")}>
              Failed ❌ ({refunds.filter((r) => r.status === "FAILED").length})
            </button>

            <button className="r-print-btn" style={{ float:"right", marginRight:"70px", backgroundColor:"pink" }} onClick={() => window.print()}>
              🖨️ Print Report
            </button>
          </div>

          {/* Refunds Table */}
          {loading ? (
            <p>Loading refunds...</p>
          ) : filteredRefunds.length === 0 ? (
            <p>No refunds found.</p>
          ) : (
            <table className="refund-table">
              <thead>
                <tr>
                  <th>Refund ID</th>
                  <th>Payment ID</th>
                  <th>Customer Name</th>
                  <th>Amount</th>
                  <th>Refund Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Preview</th>
                </tr>
              </thead>
              <tbody>
                {filteredRefunds.map((refund) => (
                  <React.Fragment key={refund.refundId}>
                    <tr>
                      <td>{refund.refundId}</td>
                      <td>{refund.paymentId}</td>
                      <td>{refund.customerName}</td>
                      <td>${refund.amount}</td>
                      <td>{refund.refundDate}</td>
                      <td>{refund.reason}</td>
                      <td>
                        <span className={`status-badge ${
                          refund.status === "COMPLETED"
                            ? "status-completed"
                            : refund.status === "PENDING"
                            ? "status-pending"
                            : refund.status === "FAILED"
                            ? "status-failed"
                            : ""
                        }`}>
                          {refund.status}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => setSelectedRefund(refund)} style={{backgroundColor:"skyblue",borderRadius:"25px",padding:"10px"}}>
                          View Details
                        </button>
                      </td>
                    </tr>

                    {selectedRefund && selectedRefund.refundId === refund.refundId && (
                      <div className="modal-overlay">
                        <div className="modal-content">
                          <button className="close-btn" onClick={() => setSelectedRefund(null)}>✖</button>
                          <h2>Refund Details</h2>
                          <p><strong>Customer:</strong> {selectedRefund.customerName}</p>
                          <p><strong>Payment ID:</strong> {selectedRefund.paymentId}</p>
                          <p><strong>Refund ID:</strong> {selectedRefund.refundId}</p>
                          <p><strong>Amount:</strong> ${selectedRefund.amount}</p>
                          <p><strong>Refund Date:</strong> {selectedRefund.refundDate}</p>
                          <p><strong>Reason:</strong> {selectedRefund.reason}</p>
                          <p><strong>Status:</strong> {selectedRefund.status}</p>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </main>
      </div>
    </div>
  );
};

export default RefundsDashboard;
