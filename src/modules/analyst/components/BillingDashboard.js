import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import "../styles/billing.css";
import { Fragment } from 'react';

const BillingDashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

    // for preview
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  //for usermail to display
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  console.log("Stored user:", storedUser);
  const userEmail = storedUser?.name || storedUser?.email || "Analyst";


  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch(
          "http://localhost:8082/api/analyst/billing/invoices/all",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`, // if JWT is used
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch invoices");
        }
        const data = await response.json();
        console.log("Invoices from backend:", data);
        setInvoices(data);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  // KPI calculations
  const totalBilled = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const collected = invoices
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + inv.amount, 0);
  const outstanding = totalBilled - collected;

  // Apply filter
  const filteredInvoices =
    filter === "ALL" ? invoices : invoices.filter((inv) => inv.status === filter);

   return (
    <div className="app-layout">
      <Sidebar active="billing" />
      <div className="right-section">
        <header className="topnav">
          <div className="topnav-left">
            <h1>Financial Dashboard</h1>
            <p>Monitor and manage billing & payments</p>
          </div>
          <div className="topnav-right">
            <button className="notif-btn">🔔</button>
            {/* 👇 Now userEmail is defined */}
            <span className="user-name">{userEmail}</span>
            <button className="logout-btn">Logout</button>
          </div>
        </header>

        <main className="main-content">
          {/* KPI Cards */}
          <section className="kpi-cards">
            <div className="card1">Total Billed:<p className="c1"> ${totalBilled}</p></div>
            <div className="card2">Collected:<p className="c2"> ${collected}</p></div>
            <div className="card3">Outstanding:<p className="c3"> ${outstanding}</p></div>
          </section>

          


          {/* Status Filter Nav */}
          <div className="status-nav">
            <button
              className={filter === "ALL" ? "active" : ""}
              onClick={() => setFilter("ALL")}
            >
              All ({invoices.length})
            </button>
            <button
              className={filter === "PAID" ? "active" : ""}
              onClick={() => setFilter("PAID")}
            >
              Paid ({invoices.filter((inv) => inv.status === "PAID").length})
            </button>
            <button
              className={filter === "OPEN" ? "active" : ""}
              onClick={() => setFilter("OPEN")}
            >
              Open ({invoices.filter((inv) => inv.status === "OPEN").length})
            </button>
            <button
              className={filter === "OVERDUE" ? "active" : ""}
              onClick={() => setFilter("OVERDUE")}
            >
              Overdue ({invoices.filter((inv) => inv.status === "OVERDUE").length})
            </button>
            <button
              className={filter === "CANCELLED" ? "active" : ""}
              onClick={() => setFilter("CANCELLED")}
            >
              Cancelled ({invoices.filter((inv) => inv.status === "CANCELLED").length})
            </button>


            <button className="b-print-btn" style={{ float: "right", marginRight: "70px", backgroundColor: "pink" }} onClick={() => window.print()}>
           🖨️ Print Report
          </button>


          </div>

          {/* Invoice Table */}
          {loading ? (
            <p>Loading invoices...</p>
          ) : filteredInvoices.length === 0 ? (
            <p>No invoices found.</p>
          ) : (
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Policy ID</th>
                  <th>Customer Name</th>
                  <th>Amount</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Preview</th>
                </tr>
              </thead>
              <tbody>
  {filteredInvoices.map((inv) => (
    <React.Fragment key={inv.invoiceId}>
      <tr>
        <td>{inv.invoiceId}</td>
        <td>{inv.policyId}</td>
        <td>{inv.customerName}</td>
        <td>${inv.amount}</td>
        <td>{inv.issueDate}</td>
        <td>{inv.dueDate}</td>
        <td>
          <span
            className={`status-badge ${
              inv.status === "PAID"
                ? "status-paid"
                : inv.status === "OPEN"
                ? "status-open"
                : inv.status === "OVERDUE"
                ? "status-overdue"
                : inv.status === "CANCELLED"
                ? "status-cancelled"
                : ""
            }`}
          >
            {inv.status}
          </span>
        </td>
        <td>
        <button onClick={() => setSelectedInvoice(inv)} style={{backgroundColor:"skyblue", fontStyle:"bold",border: "1px solid white", borderRadius:"25px", padding:"10px" }}>
          View Details
        </button>
          </td>

                </tr>

              {selectedInvoice && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="close-btn" onClick={() => setSelectedInvoice(null)}>✖</button>
              <h2>Customer Details</h2>
              <p><strong>Customer:</strong> {selectedInvoice.customerName}</p>
              <p><strong>Policy ID:</strong> {selectedInvoice.policyId}</p>
              <p><strong>Invoice ID:</strong> {selectedInvoice.invoiceId}</p>
              <p><strong>Amount:</strong> ${selectedInvoice.amount}</p>
              <p><strong>Issue Date:</strong> {selectedInvoice.issueDate}</p>
              <p><strong>Due Date:</strong> {selectedInvoice.dueDate}</p>
              <p><strong>Status:</strong> {selectedInvoice.status}</p>
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

export default BillingDashboard;



































//import React, { useEffect, useState } from "react";
//import Sidebar from "./Sidebar";
//import "../../../styles/billing.css";
//
//const BillingDashboard = () => {
//  const [invoices, setInvoices] = useState([]);
//  const [loading, setLoading] = useState(true);
//
//  // Example: policyId stored in localStorage after login
////  const policyId = localStorage.getItem("policyId");
//
//
//    const policyId = 1;
//  useEffect(() => {
//    const fetchInvoices = async () => {
//      try {
//        const response = await fetch(
//          `http://localhost:8082/api/analyst/billing/policies/${policyId}/cinvoices`,
//          {
//            headers: {
//              "Content-Type": "application/json",
//              Authorization: `Bearer ${localStorage.getItem("token")}`, // if JWT is used
//            },
//          }
//        );
//        if (!response.ok) {
//          throw new Error("Failed to fetch invoices");
//        }
//        const data = await response.json();
//        console.log("Invoices from backend:", data); // Debug log
//        setInvoices(data);
//      } catch (error) {
//        console.error("Error fetching invoices:", error);
//      } finally {
//        setLoading(false);
//      }
//    };
//
//    if (policyId) {
//      fetchInvoices();
//    }
//  }, [policyId]);
//
//  // KPI calculations
//  const totalBilled = invoices.reduce((sum, inv) => sum + inv.amount, 0);
//  const collected = invoices
//    .filter((inv) => inv.status === "PAID")
//    .reduce((sum, inv) => sum + inv.amount, 0);
//  const outstanding = totalBilled - collected;
//
//  return (
//    <div className="app-layout">
//      <Sidebar active="billing" />
//      <div className="right-section">
//        <header className="topnav">
//          <div className="topnav-left">
//            <h1>Financial Dashboard</h1>
//            <p>Monitor and manage billing & payments</p>
//          </div>
//          <div className="topnav-right">
//            <button className="notif-btn">🔔</button>
//            <span className="user-name">Sarah Johnson</span>
//            <button className="logout-btn">Logout</button>
//          </div>
//        </header>
//
//        <main className="main-content">
//          {/* KPI Cards */}
//          <section className="kpi-cards">
//            <div className="card">Total Billed: ${totalBilled}</div>
//            <div className="card">Collected: ${collected}</div>
//            <div className="card">Outstanding: ${outstanding}</div>
//          </section>
//
//          {/* Invoice Table */}
//          {loading ? (
//            <p>Loading invoices...</p>
//          ) : invoices.length === 0 ? (
//            <p>No invoices found.</p>
//          ) : (
//            <table className="invoice-table">
//              <thead>
//                <tr>
//                  <th>Invoice ID</th>
//                  <th>Policy ID</th>
//                   <th>Customer Name</th>
//                  <th>Amount</th>
//                  <th>Issue Date</th>
//                  <th>Due Date</th>
//                  <th>Status</th>
//                </tr>
//              </thead>
//              <tbody>
//                {invoices.map((inv) => (
//                  <tr key={inv.invoiceId}>
//                    <td>{inv.invoiceId}</td>
//                    <td>{inv.policyId}</td>
//                    <td>{inv.customerName}</td>
//                    <td>${inv.amount}</td>
//                    <td>{inv.issueDate}</td>
//                    <td>{inv.dueDate}</td>
//                    <td>{inv.status}</td>
//                  </tr>
//                ))}
//              </tbody>
//            </table>
//          )}
//        </main>
//      </div>
//    </div>
//  );
//};
//
//export default BillingDashboard;
