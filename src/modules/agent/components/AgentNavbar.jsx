import React from 'react';
import { FiSearch, FiBell, FiPlus } from 'react-icons/fi';
import '../styles/agentLayout.css';

// Added onOpenModal prop to allow the parent (Layout) to control the modal state
const AgentNavbar = ({ onOpenModal }) => {
    return (
        <header className="main-navbar">
            <div className="search-container">
                <FiSearch className="search-icon" />
                <input 
                    type="text" 
                    placeholder="Search quotes, policies, customers..." 
                    className="nav-search-input"
                />
            </div>

            <div className="nav-actions">
                {/* Added onClick handler to trigger the modal opening function */}
                <button className="create-quote-btn" onClick={onOpenModal}>
                    <FiPlus /> Create Quote
                </button>
                
                <div className="notification-icon">
                    <FiBell />
                    <span className="dot"></span>
                </div>

                <div className="user-profile-nav">
                    <div className="user-text">
                        <span className="user-name">John Anderson</span>
                        <span className="user-role">Insurance Agent</span>
                    </div>
                    <div className="user-avatar">JA</div>
                </div>
            </div>
        </header>
    );
};

export default AgentNavbar;