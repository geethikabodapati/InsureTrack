import React from 'react';
import './ContactUs.css';

const ContactUs = () => {
    return (
        <div className="contact-container">
            <header className="contact-hero">
                <h1 className="contact-title">Get In Touch</h1>
                <p className="contact-subtitle">
                    We're here to help. Reach out to our management team for any inquiries, support, or partnership opportunities.
                </p>
            </header>

            <section className="contact-content">
                <div className="contact-grid">
                    <div className="contact-card">
                        <div className="contact-icon">📧</div>
                        <h3>General Inquiries</h3>
                        <p>For general questions about the platform or its features.</p>
                        <a href="mailto:info@insuretrack.com" className="email-link">info@insuretrack.com</a>
                    </div>
                    
                    <div className="contact-card">
                        <div className="contact-icon">🛠️</div>
                        <h3>Technical Support</h3>
                        <p>Need help with your account or experiencing technical issues?</p>
                        <a href="mailto:support@insuretrack.com" className="email-link">support@insuretrack.com</a>
                    </div>

                    <div className="contact-card">
                        <div className="contact-icon">🤝</div>
                        <h3>Partnerships & Sales</h3>
                        <p>Contact our management team to discuss Enterprise solutions.</p>
                        <a href="mailto:management@insuretrack.com" className="email-link">management@insuretrack.com</a>
                    </div>
                </div>

                <div className="management-details">
                    <h2>Management Team</h2>
                    <div className="management-list">
                        <div className="manager-item">
                            <h4>Geethika Bodapati</h4>
                            <p>Chief Executive Officer</p>
                            <a href="mailto:sarah.j@insuretrack.com">geethika@insuretrack.com</a>
                        </div>
                        <div className="manager-item">
                            <h4>Vasudha</h4>
                            <p>Chief Technology Officer</p>
                            <a href="mailto:david.r@insuretrack.com">vasudha@insuretrack.com</a>
                        </div>
                        <div className="manager-item">
                            <h4>Anusha</h4>
                            <p>Head of Client Relations</p>
                            <a href="mailto:michael.c@insuretrack.com">anusha@insuretrack.com</a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContactUs;
