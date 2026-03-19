import React, { useState } from 'react'; // Added useState to manage modal visibility
import { Outlet } from 'react-router-dom';
import AgentSidebar from './components/AgentSidebar';
import AgentNavbar from './components/AgentNavbar';
import CreateQuoteModal from './components/CreateQuoteModal'; // Imported the new modal component
import './styles/agentLayout.css';
//import '../../styles/DashboardLayout.css';

const AgentLayout = ({ children }) => {
    // State to track if the Create Quote modal is visible
    const [isModalOpen, setIsModalOpen] = useState(false); // Initialize modal state as closed

    // Function to handle successful quote creation (e.g., refresh data or show notification)
    const handleQuoteSuccess = (data) => {
        console.log("New Quote Created:", data);
        // You can add a toast notification here later
    };

    return (
        <div className="agent-app-shell">
            <AgentSidebar />
            <div className="content-area">
                {/* Passed onOpenModal prop to Navbar to trigger the state change */}
                <AgentNavbar onOpenModal={() => setIsModalOpen(true)} /> 
                
                <div className="scrollable-content">
                    {children || <Outlet />}
                </div>
            </div>

            {/* Rendered the Modal at the root of the layout to ensure it overlays correctly */}
            <CreateQuoteModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={handleQuoteSuccess}
            />
        </div>
    );
};

export default AgentLayout;