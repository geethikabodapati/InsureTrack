import React from "react";
import Navbar from './Navbar'
const Dashboard=()=>{
    const role=localStorage.getItem("role");
    return (
        <div>
            <Navbar/>
            <div style={{padding:"40px"}}>
                <h1>Welcome To InsureTrack</h1>
                <h2>You are :{role}</h2>
            </div>
        </div>
    )
}
export default Dashboard;