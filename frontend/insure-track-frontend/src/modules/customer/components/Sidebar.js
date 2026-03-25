import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/overview.css';
const Sidebar = () => {
    const [isLocked, setIsLocked] = useState(true);

    const checkLockStatus = () => {
        const customerId = localStorage.getItem("customerId");
        const user = JSON.parse(localStorage.getItem("user"));
        
        // If we have an ID or the role is CUSTOMER, unlock everything
        if (customerId || user?.role === 'CUSTOMER') {
            setIsLocked(false);
        } else {
            setIsLocked(true);
        }
    };

    useEffect(() => {
        checkLockStatus(); // Check on load

        // LISTEN FOR THE SIGNALS
        window.addEventListener("storage", checkLockStatus);
        window.addEventListener("unlockSystem", checkLockStatus);

        return () => {
            window.removeEventListener("storage", checkLockStatus);
            window.removeEventListener("unlockSystem", checkLockStatus);
        };
    }, []);

    return (
        <div className="sidebar bg-light vh-100 p-3 shadow-sm">
            <nav className="nav flex-column">
                <Link className="nav-link" to="/profile">My Profile</Link>
                
                {/* AUTOMATICALLY UNLOCKED LINKS */}
                <Link className={`nav-link ${isLocked ? 'disabled text-muted' : ''}`} 
                      to={isLocked ? "#" : "/beneficiaries"}>
                    Beneficiaries {isLocked && "🔒"}
                </Link>

                <Link className={`nav-link ${isLocked ? 'disabled text-muted' : ''}`} 
                      to={isLocked ? "#" : "/insured-objects"}>
                    Insured Objects {isLocked && "🔒"}
                </Link>

                <Link className={`nav-link ${isLocked ? 'disabled text-muted' : ''}`} 
                      to={isLocked ? "#" : "/policies"}>
                    Policies {isLocked && "🔒"}
                </Link>
                 <Link className={`nav-link ${isLocked ? 'disabled text-muted' : ''}`} 
                      to={isLocked ? "#" : "/Coverages"}>
                    Coverages {isLocked && "🔒"}
                </Link>
                <Link className={`nav-link ${isLocked ? 'disabled text-muted' : ''}`} 
                      to={isLocked ? "#" : "/Quotes"}>
                    Quotes {isLocked && "🔒"}
                </Link>
            </nav>
        </div>
    );
};

export default Sidebar;