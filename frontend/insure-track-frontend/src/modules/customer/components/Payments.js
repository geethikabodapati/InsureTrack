import React, { useState, useEffect } from 'react';
import API, { getInvoicesByPolicy, makePayment } from '../../../core/services/api';
import { CreditCard, Smartphone, Receipt, Loader2, AlertCircle } from 'lucide-react';
 
const Payments = () => {
    const [policies, setPolicies] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
   
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('CARD');
 
    const customerId = localStorage.getItem("customerId");
 
    useEffect(() => {
        const fetchPolicies = async () => {
            try {
                const response = await API.get(`/agent/policies/customers/${customerId}`);
                setPolicies(response.data);
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        fetchPolicies();
    }, [customerId]);
 
    const handleViewInvoices = async (policyId) => {
        setLoading(true);
        try {
            const res = await getInvoicesByPolicy(policyId);
            setInvoices(res.data);
        } catch (err) { alert("Could not fetch invoices"); }
        finally { setLoading(false); }
    };
 
    const handleOpenPayment = (invoice) => {
        setSelectedInvoice(invoice);
        setShowModal(true);
    };
 
   /* const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                amount: selectedInvoice.amount,
                method: paymentMethod // Matches PaymentMethod enum: CARD, UPI
            };*/
            const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try{
    const payload = {
        amount: parseFloat(selectedInvoice.amount),
        method: paymentMethod // Ensure this is 'CARD' or 'UPI'
    };
 
            await makePayment(selectedInvoice.invoiceId, payload);
            alert("Payment completed successfully! Invoice is now PAID.");
            setShowModal(false);
            // Refresh invoices
            handleViewInvoices(selectedInvoice.policyId);
        } catch (err) {
            alert(err.response?.data?.message || "Payment Failed");
        } finally { setSubmitting(false); }
    };
 
    if (loading) return <div className="text-center mt-5"><Loader2 className="animate-spin" /> Loading billing data...</div>;
 
    return (
        <div className="container mt-4">
            <h3 className="fw-bold text-primary mb-4">Billing & Payments</h3>
           
            <div className="row">
                {/* Policy List */}
                <div className="col-md-4">
                    <h5 className="mb-3 fw-bold">Select Policy</h5>
                    {policies.map(p => (
                        <div key={p.policyId} className="card mb-2 shadow-sm border-0 cursor-pointer p-3"
                             onClick={() => handleViewInvoices(p.policyId)} style={{cursor: 'pointer'}}>
                            <div className="fw-bold">{p.policyNumber}</div>
                            <small className="text-muted">Status: {p.status}</small>
                        </div>
                    ))}
                </div>
 
                {/* Invoice List */}
                <div className="col-md-8">
                    <h5 className="mb-3 fw-bold">Invoices</h5>
                    {invoices.length === 0 ? (
                        <div className="alert alert-light border shadow-sm">Select a policy to view pending invoices.</div>
                    ) : (
                        invoices.map(inv => (
                            <div key={inv.invoiceId} className="card mb-3 shadow-sm border-0 border-start border-4 border-warning">
                                <div className="card-body d-flex justify-content-between align-items-center">
                                    <div>
                                        <div className="text-muted small">Invoice #{inv.invoiceId}</div>
                                        <div className="fw-bold fs-5">₹{inv.amount}</div>
                                        <div className="small">Due: {inv.dueDate}</div>
                                    </div>
                                    <div>
                                        {inv.status === 'OPEN' ? (
                                            <button className="btn btn-primary fw-bold" onClick={() => handleOpenPayment(inv)}>Pay Invoice</button>
                                        ) : (
                                            <span className="badge bg-success p-2">PAID</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
 
            {/* Payment Modal remains same as previous logic but hits makePayment(invoiceId) */}
            {showModal && (
                <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header border-0">
                                <h5 className="modal-title fw-bold">Confirm Payment</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p>Paying <strong>₹{selectedInvoice.amount}</strong> for Invoice #{selectedInvoice.invoiceId}</p>
                                <div className="d-flex gap-3">
                                    <button className={`btn w-50 ${paymentMethod === 'CARD' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setPaymentMethod('CARD')}>CARD</button>
                                    <button className={`btn w-50 ${paymentMethod === 'UPI' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setPaymentMethod('UPI')}>UPI</button>
                                </div>
                            </div>
                            <div className="modal-footer border-0">
                                <button className="btn btn-success w-100 fw-bold" onClick={handlePaymentSubmit} disabled={submitting}>
                                    {submitting ? "Processing..." : "Complete Payment"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
 
export default Payments;