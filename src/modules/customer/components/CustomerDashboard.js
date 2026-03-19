import React from "react";
import Navbar from '../../../core/components/Navbar'
const CustomerDashboard=()=>{
    // const role=localStorage.getItem("role");
    return (
        <div>
            <Navbar/>
            <div style={{padding:"40px"}}>
                <h1>Welcome Customer</h1>
            </div>
        </div>
    )
}
export default CustomerDashboard;