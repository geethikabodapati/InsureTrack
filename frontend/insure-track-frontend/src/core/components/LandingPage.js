import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import {ChevronRight} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">

      <main className="landing-main">
        <section className="hero-section">
          <h1 className="hero-title">Your Comprehensive Insurance Management Solution</h1>
          <p className="hero-subtitle">
            Streamlining policies, claims, and underwriting with modern, enterprise-grade tools.
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary btn-large" onClick={() => navigate('/register')}>Get Started</button>
          </div>
        </section>

        <section className="features-section">
          <h2 className="section-title">Built For Every Role</h2>
          <div className="cards-grid">
            <div className="feature-card">
              <div className="card-icon">👥</div>
              <h3>Customers</h3>
              <p>Manage your policies, file claims easily, and track their status in real-time.</p>
            </div>
            <div className="feature-card">
              <div className="card-icon">🤝</div>
              <h3>Agents</h3>
              <p>Create quotes, manage client policies, and handle endorsements seamlessly.</p>
            </div>
            <div className="feature-card">
              <div className="card-icon">📋</div>
              <h3>Adjusters</h3>
              <p>Evaluate claims efficiently, manage evidence, and process settlements.</p>
            </div>
            <div className="feature-card">
              <div className="card-icon">⚖️</div>
              <h3>Underwriters</h3>
              <p>Assess risks accurately, review complex cases, and make informed decisions.</p>
            </div>
            <div className="feature-card">
              <div className="card-icon">📈</div>
              <h3>Analysts</h3>
              <p>Monitor system-wide metrics, payment flows, and billing reports.</p>
            </div>
            <div className="feature-card">
              <div className="card-icon">⚙️</div>
              <h3>Administrators</h3>
              <p>Configure rating rules, manage users, and audit system activities.</p>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="landing-footer">
        <p>&copy; {new Date().getFullYear()} InsureTrack. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
