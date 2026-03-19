import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import "../styles/claims.css";

const ClaimsDashboard = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  // for preview modal
  const [selectedClaim, setSelectedClaim] = useState(null);

  // user info
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userEmail = storedUser?.name || storedUser?.email || "Analyst";

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await fetch(
          "http://localhost:8082/api/adjuster/claims/all",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch claims");
        }
        const data = await response.json();
        console.log("Claims from backend:", data);
        setClaims(data);
      } catch (error) {
        console.error("Error fetching claims:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  // KPI calculations
  const totalClaims = claims.length;
  const approved = claims.filter((c) => c.status === "ADJUDICATED" || c.status === "SETTLED").length;
  const underReview = claims.filter((c) => c.status === "INVESTIGATING").length;
  const denied = claims.filter((c) => c.status === "DENIED").length;

  // Apply filter
  const filteredClaims =
    filter === "ALL" ? claims : claims.filter((c) => c.status === filter);

  return (
    <div className="app-layout">
      <Sidebar active="claims" />
      <div className="right-section">
        <header className="topnav">
          <div className="topnav-left">
            <h1>Claims Dashboard</h1>
            <p>Track and manage all claims</p>
          </div>
          <div className="topnav-right">
            <button className="notif-btn">🔔</button>
            <span className="user-name">{userEmail}</span>
            <button className="logout-btn">Logout</button>
          </div>
        </header>

        <main className="main-content">
          {/* KPI Cards */}
          <section className="c-kpi-cards" style={{display: "flex", gap: "30px", marginBottom: "30px"}}>
            <div className="card1" style={{backgroundColor:"blue", color:"white", padding:"25px", borderRadius:"6px", flex:"1"}}>
              Total Claims: <span style={{fontSize:"25px"}}>{totalClaims}</span>
            </div>
            <div className="card2" style={{backgroundColor:"green", color:"white", padding:"25px", borderRadius:"6px", flex:"1"}}>
              Approved/Settled: <span style={{fontSize:"25px"}}>{approved}</span>
            </div>
            <div className="card3" style={{backgroundColor:"orange", color:"white", padding:"25px", borderRadius:"6px", flex:"1"}}>
              Under Review: <span style={{fontSize:"25px"}}>{underReview}</span>
            </div>
            <div className="card4" style={{backgroundColor:"red", color:"white", padding:"25px", borderRadius:"6px", flex:"1"}}>
              Denied: <span style={{fontSize:"25px"}}>{denied}</span>
            </div>
          </section>

          {/* Status Filter Nav */}
          <div className="status-nav">
            <button className={filter === "ALL" ? "active" : ""} onClick={() => setFilter("ALL")}>
              All ({claims.length})
            </button>
            <button className={filter === "ADJUDICATED" ? "active" : ""} onClick={() => setFilter("ADJUDICATED")}>
              Approved ✅ ({claims.filter((c) => c.status === "ADJUDICATED").length})
            </button>
            <button className={filter === "INVESTIGATING" ? "active" : ""} onClick={() => setFilter("INVESTIGATING")}>
              Under Review ⏳ ({claims.filter((c) => c.status === "INVESTIGATING").length})
            </button>
            <button className={filter === "DENIED" ? "active" : ""} onClick={() => setFilter("DENIED")}>
              Rejected ❌ ({claims.filter((c) => c.status === "DENIED").length})
            </button>
            <button className="c-print-btn" style={{ float: "right", marginRight: "70px", backgroundColor: "pink" }} onClick={() => window.print()}>
              🖨️ Print Report
            </button>
          </div>

          {/* Claims Table */}
          {loading ? (
            <p>Loading claims...</p>
          ) : filteredClaims.length === 0 ? (
            <p>No claims found.</p>
          ) : (
            <table className="claim-table">
              <thead>
                <tr>
                  <th>Claim ID</th>
                  <th>Customer</th>
                  <th>Policy</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Submitted</th>
                  <th>Processed</th>
                  <th>Status</th>
                  <th>Preview</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.map((claim) => (
                  <React.Fragment key={claim.claimId}>
                    <tr>
                      <td>{claim.claimId}</td>
                      <td>{claim.customerName}</td>
                      <td>{claim.policyId}</td>
                      <td>{claim.claimType}</td>
                      <td>${claim.amount}</td>
                      <td>{claim.reportedDate}</td>
                      <td>{claim.processedDate || "-"}</td>
                      <td>
                        <span className={`status-badge status-${claim.status.toLowerCase()}`}>
                          {claim.status}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => setSelectedClaim(claim)} style={{backgroundColor:"skyblue", borderRadius:"25px", padding:"10px"}}>
                          View Details
                        </button>
                      </td>
                    </tr>

                    {selectedClaim && selectedClaim.claimId === claim.claimId && (
                      <div className="modal-overlay">
                        <div className="modal-content">
                          <button className="close-btn" onClick={() => setSelectedClaim(null)}>✖</button>
                          <h2>Claim Details</h2>
                          <p><strong>Customer:</strong> {selectedClaim.customerName}</p>
                          <p><strong>Policy:</strong> {selectedClaim.policyId}</p>
                          <p><strong>Claim ID:</strong> {selectedClaim.claimId}</p>
                          <p><strong>Type:</strong> {selectedClaim.claimType}</p>
                          <p><strong>Amount:</strong> ${selectedClaim.amount}</p>
                          <p><strong>Submitted:</strong> {selectedClaim.reportedDate}</p>
                          <p><strong>Processed:</strong> {selectedClaim.processedDate || "-"}</p>
                          <p><strong>Status:</strong> {selectedClaim.status}</p>
                          <p><strong>Description:</strong> {selectedClaim.description}</p>
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

export default ClaimsDashboard;
