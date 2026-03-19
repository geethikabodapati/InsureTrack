import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import "../styles/billing.css";

const PaymentsDashboard = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  // for preview
  const [selectedPayment, setSelectedPayment] = useState(null);
  
  //for usermail to display
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  console.log("Stored user:", storedUser);
  const userEmail = storedUser?.name || storedUser?.email || "Analyst";


  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch(
          "http://localhost:8082/api/analyst/billing/payments/all",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch payments");
        }
        const data = await response.json();
        console.log("Payments from backend:", data);
        setPayments(data);
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // KPI calculations
  const totalPayments = payments.reduce((sum, pay) => sum + pay.amount, 0);
  const completed = payments
    .filter((pay) => pay.status === "COMPLETED")
    .reduce((sum, pay) => sum + pay.amount, 0);
  const pending = payments
    .filter((pay) => pay.status === "PENDING")
    .reduce((sum, pay) => sum + pay.amount, 0);
  const failed = payments
    .filter((pay) => pay.status === "FAILED")
    .reduce((sum, pay) => sum + pay.amount, 0);

  // Apply filter
  const filteredPayments =
    filter === "ALL" ? payments : payments.filter((pay) => pay.status === filter);

  return (
    <div className="app-layout">
      <Sidebar active="payments" />
      <div className="right-section">
        <header className="topnav">
          <div className="topnav-left">
            <h1>Payments Dashboard</h1>
            <p>Track and manage all payments</p>
          </div>
          <div className="topnav-right">
            <button className="notif-btn">🔔</button>
            <span className="user-name">{userEmail}</span>
            <button className="logout-btn">Logout</button>
          </div>
        </header>

        <main className="main-content">
          {/* KPI Cards */}
          <section className="p-kpi-cards"  style={{display: "flex",gap: "30px",marginBottom: "30px",padding:"0px"}}>

            <div className="card1" style={{backgroundColor:"blue", color: "white", padding: "25px", borderRadius: "6px",boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              flex: "1",fontWeight: "bold", fontSize:"15px"}}>
              Total Payments:<span className="c1" style={{fontSize:"25px"}}><p> ${totalPayments}</p></span>
            </div>
            <div className="card2" style={{backgroundColor:"green", color: "white", padding: "25px", borderRadius: "6px",boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              flex: "1",fontWeight: "bold", fontSize:"15px"}}>
              Completed:<span className="c2" style={{fontSize:"25px"}}> <p>${completed}</p></span>
            </div>
            <div className="card3" style={{backgroundColor:"orange", color: "white", padding: "25px", borderRadius: "6px",boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              flex: "1",fontWeight: "bold", fontSize:"15px"}}>
              Pending:<span className="c3" style={{fontSize:"25px"}}><p> ${pending}</p></span>
            </div>
            <div className="card4" style={{backgroundColor:"red", color: "white", padding: "25px", borderRadius: "6px",boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              flex: "1",fontWeight: "bold", fontSize:"15px"}}>
              Failed:<span className="c4" style={{fontSize:"25px"}}><p> ${failed}</p></span>
            </div>
          </section>

          {/* Status Filter Nav */}
          <div className="status-nav">
            <button
              className={filter === "ALL" ? "active" : ""}
              onClick={() => setFilter("ALL")}
            >
              All ({payments.length})
            </button>
            <button
              className={filter === "COMPLETED" ? "active" : ""}
              onClick={() => setFilter("COMPLETED")}
            >
              Completed✅({payments.filter((p) => p.status === "COMPLETED").length})
            </button>
            <button
              className={filter === "PENDING" ? "active" : ""}
              onClick={() => setFilter("PENDING")}
            >
              Pending⏳ ({payments.filter((p) => p.status === "PENDING").length})
            </button>
            <button
              className={filter === "FAILED" ? "active" : ""}
              onClick={() => setFilter("FAILED")}
            >
              Failed❌ ({payments.filter((p) => p.status === "FAILED").length})
            </button>


            <button className="p-print-btn" style={{ float: "right", marginRight: "70px", backgroundColor: "pink"  }}  onClick={() => window.print()}>
            🖨️ Print Report
            </button>

          </div>

          {/* Payments Table */}
          {loading ? (
            <p>Loading payments...</p>
          ) : filteredPayments.length === 0 ? (
            <p>No payments found.</p>
          ) : (
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Invoice ID</th>
                  <th>Customer Name</th>
                  <th>Amount</th>
                  <th>Paid Date</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Preview</th>
                </tr>
              </thead>
             <tbody>
  {filteredPayments.map((pay) => (
    <React.Fragment key={pay.paymentId}>
      <tr>
        <td>{pay.paymentId}</td>
        <td>{pay.invoiceId}</td>
        <td>{pay.customerName}</td>
        <td>${pay.amount}</td>
        <td>{pay.paidDate}</td>
        <td>{pay.method}</td>
        <td>
          <span
            className={`status-badge ${
              pay.status === "COMPLETED"
                ? "status-completed"
                : pay.status === "PENDING"
                ? "status-pending"
                : pay.status === "FAILED"
                ? "status-failed"
                : ""
            }`}
          >
            {pay.status}
          </span>
        </td>
        <td>
          <button onClick={() => setSelectedPayment(pay)} style={{backgroundColor:"skyblue", fontStyle:"bold",border: "1px solid white", borderRadius:"25px", padding:"10px" }}>
            View Details
          </button>
        </td>
      </tr>

      {selectedPayment && selectedPayment.paymentId === pay.paymentId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="close-btn"
              onClick={() => setSelectedPayment(null)}
            >
              ✖
            </button>
            <h2>Payment Details</h2>
            <p><strong>Customer:</strong> {selectedPayment.customerName}</p>
            <p><strong>Invoice ID:</strong> {selectedPayment.invoiceId}</p>
            <p><strong>Payment ID:</strong> {selectedPayment.paymentId}</p>
            <p><strong>Amount:</strong> ${selectedPayment.amount}</p>
            <p><strong>Paid Date:</strong> {selectedPayment.paidDate}</p>
            <p><strong>Method:</strong> {selectedPayment.method}</p>
            <p><strong>Status:</strong> {selectedPayment.status}</p>
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

export default PaymentsDashboard;














// import React from "react";
// import Sidebar from "./Sidebar";
// import "../../../styles/payment.css";

// const PaymentsDashboard = () => (
//   <div className="dashboard-layout">
//     <Sidebar active="payments" />
//     <div className="main-content">
//       {/* Topbar + KPIs + Payment Table */}
//     </div>
//   </div>
// );

// export default PaymentsDashboard;